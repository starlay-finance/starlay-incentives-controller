import { expect } from 'chai';
import rawHRE from 'hardhat';
import { BigNumber } from 'ethers';
import { formatEther, parseEther, parseUnits } from 'ethers/lib/utils';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';
import { JsonRpcSigner } from '@ethersproject/providers';

import { DRE, waitForTx } from '../helpers/misc-utils';
import {
  evmSnapshot,
  increaseTime,
  evmRevert,
  latestBlock,
  advanceBlockTo,
  impersonateAccountsHardhat,
} from '../helpers/misc-utils';
import { MAX_UINT_AMOUNT, ZERO_ADDRESS } from '../helpers/constants';
import { IERC20 } from '../types/IERC20';
import { IStarlayGovernanceV2 } from '../types/IStarlayGovernanceV2';
import { ILendingPool } from '../types/ILendingPool';
import {
  StakedTokenIncentivesControllerFactory,
  LToken,
  LTokenFactory,
  InitializableAdminUpgradeabilityProxyFactory,
  ProposalIncentivesExecutorFactory,
  SelfdestructTransferFactory,
} from '../types';
import { tEthereumAddress } from '../helpers/types';
import { IERC20Factory } from '../types/IERC20Factory';
import { ILTokenFactory } from '../types/ILTokenFactory';
import { getRewards } from '../test/DistributionManager/data-helpers/base-math';
import { getUserIndex } from '../test/DistributionManager/data-helpers/asset-user-data';
import { IERC20DetailedFactory } from '../types/IERC20DetailedFactory';
import { fullCycleLendingPool, getReserveConfigs, spendList } from './helpers';
import {
  deployStakedTokenIncentivesController,
  deployInitializableAdminUpgradeabilityProxy,
} from '../helpers/contracts-accessors';
import { withSaveAndVerify } from '../helpers/contracts-helpers';

const {
  RESERVES = 'DAI,GUSD,USDC,USDT,WBTC,WETH',
  POOL_CONFIGURATOR = '0x311bb771e4f8952e6da169b425e7e92d6ac45756',
  POOL_PROVIDER = '0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5',
  POOL_DATA_PROVIDER = '0x057835Ad21a177dbdd3090bB1CAE03EaCF78Fc6d',
  ECO_RESERVE = '0x25F2226B597E8F9514B3F68F00f494cF4f286491',
  STARLAY_TOKEN = '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
  TREASURY = '0x464c71f6c2f760dda6093dcb91c24c39e5d6e18c',
  IPFS_HASH = 'QmT9qk3CRYbFDWpDFYeAv8T8H1gnongwKhh5J68NLkLir6',
  GOVERNANCE_V2 = '0xEC568fffba86c094cf06b22134B23074DFE2252c', // mainnet
  STARLAY_SHORT_EXECUTOR = '0xee56e2b3d491590b5b31738cc34d5232f378a8d5', // mainnet
} = process.env;

if (
  !RESERVES ||
  !POOL_CONFIGURATOR ||
  !POOL_DATA_PROVIDER ||
  !ECO_RESERVE ||
  !STARLAY_TOKEN ||
  !IPFS_HASH ||
  !GOVERNANCE_V2 ||
  !STARLAY_SHORT_EXECUTOR ||
  !TREASURY
) {
  throw new Error('You have not set correctly the .env file, make sure to read the README.md');
}

const LENDING_POOL = '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9';
const VOTING_DURATION = 19200;

const STARLAY_WHALE = '0x25f2226b597e8f9514b3f68f00f494cf4f286491';

const STAKED_STARLAY = '0x4da27a545c0c5B758a6BA100e3a049001de870f5';
const DAI_TOKEN = '0x6b175474e89094c44da98b954eedeac495271d0f';
const DAI_HOLDER = '0x72aabd13090af25dbb804f84de6280c697ed1150';

describe('Enable incentives in target assets', () => {
  let ethers;

  let whale: JsonRpcSigner;
  let daiHolder: JsonRpcSigner;
  let proposer: SignerWithAddress;
  let incentivesProxyAdmin: SignerWithAddress;
  let incentivesProxy: tEthereumAddress;
  let gov: IStarlayGovernanceV2;
  let pool: ILendingPool;
  let layToken: IERC20;
  let stakedLay: IERC20;
  let dai: IERC20;
  let lDAI: LToken;
  let variableDebtDAI: IERC20;
  let snapshotId: string;
  let proposalId: BigNumber;
  let lTokensImpl: [
    tEthereumAddress,
    tEthereumAddress,
    tEthereumAddress,
    tEthereumAddress,
    tEthereumAddress,
    tEthereumAddress
  ];
  let variableDebtTokensImpl: [
    tEthereumAddress,
    tEthereumAddress,
    tEthereumAddress,
    tEthereumAddress,
    tEthereumAddress,
    tEthereumAddress
  ];
  let proposalExecutionPayload: tEthereumAddress;
  let symbols: {
    [key: string]: {
      lToken: { symbol: string; name: string };
      variableDebtToken: { symbol: string; name: string };
    };
  } = {};
  /*
    afterEach(async () => {
      evmRevert(snapshotId);
      snapshotId = await evmSnapshot();
    });
  */
  before(async () => {
    await rawHRE.run('set-DRE');
    ethers = DRE.ethers;
    [proposer, incentivesProxyAdmin] = await DRE.ethers.getSigners();

    // Deploy incentives implementation
    const { address: incentivesImplementation } = await deployStakedTokenIncentivesController([
      STAKED_STARLAY,
      STARLAY_SHORT_EXECUTOR,
    ]);
    const incentivesInitParams = StakedTokenIncentivesControllerFactory.connect(
      incentivesImplementation,
      proposer
    ).interface.encodeFunctionData('initialize');

    // Deploy incentives proxy (Proxy Admin should be the provider, TBD)
    const { address: incentivesProxyAddress } = await deployInitializableAdminUpgradeabilityProxy();
    incentivesProxy = incentivesProxyAddress;

    // Initialize proxy for incentives controller
    const incentivesProxyInstance = InitializableAdminUpgradeabilityProxyFactory.connect(
      incentivesProxy,
      proposer
    );
    await waitForTx(
      await incentivesProxyInstance['initialize(address,address,bytes)'](
        incentivesImplementation,
        incentivesProxyAdmin.address,
        incentivesInitParams
      )
    );

    // Deploy lTokens and debt tokens
    const { lTokens, variableDebtTokens } = await rawHRE.run('deploy-reserve-implementations', {
      provider: POOL_PROVIDER,
      assets: RESERVES,
      incentivesController: incentivesProxy,
      treasury: TREASURY,
    });

    lTokensImpl = [
      ...(lTokens as [
        tEthereumAddress,
        tEthereumAddress,
        tEthereumAddress,
        tEthereumAddress,
        tEthereumAddress,
        tEthereumAddress
      ]),
    ];
    variableDebtTokensImpl = [
      ...(variableDebtTokens as [
        tEthereumAddress,
        tEthereumAddress,
        tEthereumAddress,
        tEthereumAddress,
        tEthereumAddress,
        tEthereumAddress
      ]),
    ];

    // Deploy Proposal Executor Payload
    const { address: proposalExecutionPayloadAddress } = await withSaveAndVerify(
      await new ProposalIncentivesExecutorFactory(proposer).deploy(),
      'ProposalIncentivesExecutor',
      [],
      true
    );
    proposalExecutionPayload = proposalExecutionPayloadAddress;
    // Send ether to the STARLAY_WHALE, which is a non payable contract via selfdestruct
    const selfDestructContract = await new SelfdestructTransferFactory(proposer).deploy();
    await (
      await selfDestructContract.destroyAndTransfer(STARLAY_WHALE, {
        value: ethers.utils.parseEther('1'),
      })
    ).wait();
    // Send ether to the GOV, which is a non payable contract via selfdestruct
    const selfDestructContractV2 = await new SelfdestructTransferFactory(proposer).deploy();
    await (
      await selfDestructContractV2.destroyAndTransfer(GOVERNANCE_V2, {
        value: ethers.utils.parseEther('1'),
      })
    ).wait();
    // Send ether to the Short Executor, which is a non payable contract via selfdestruct
    const selfDestructContractV3 = await new SelfdestructTransferFactory(proposer).deploy();
    await (
      await selfDestructContractV3.destroyAndTransfer(STARLAY_SHORT_EXECUTOR, {
        value: ethers.utils.parseEther('1'),
      })
    ).wait();
    await impersonateAccountsHardhat([
      STARLAY_WHALE,
      ...Object.keys(spendList).map((k) => spendList[k].holder),
      GOVERNANCE_V2,
      STARLAY_SHORT_EXECUTOR,
    ]);

    // Impersonating holders
    whale = ethers.provider.getSigner(STARLAY_WHALE);
    daiHolder = ethers.provider.getSigner(DAI_HOLDER);

    // Initialize contracts and tokens
    gov = (await ethers.getContractAt(
      'IStarlayGovernanceV2',
      GOVERNANCE_V2,
      proposer
    )) as IStarlayGovernanceV2;
    pool = (await ethers.getContractAt(
      'ILendingPool',
      LENDING_POOL,
      proposer
    )) as ILendingPool;

    const {
      configuration: { data },
      lTokenAddress,
      variableDebtTokenAddress,
    } = await pool.getReserveData(DAI_TOKEN);

    layToken = IERC20Factory.connect(STARLAY_TOKEN, whale);
    stakedLay = IERC20Factory.connect(STAKED_STARLAY, proposer);
    dai = IERC20Factory.connect(DAI_TOKEN, daiHolder);
    lDAI = LTokenFactory.connect(lTokenAddress, proposer);
    variableDebtDAI = IERC20Factory.connect(variableDebtTokenAddress, proposer);

    // Transfer enough Starlay to proposer
    await (await layToken.transfer(proposer.address, parseEther('2000000'))).wait();

    // Transfer DAI to repay future DAI loan
    const lastTx = await (await dai.transfer(proposer.address, parseEther('100000'))).wait();

    // Save lToken and debt token names
    const reserveConfigs = await getReserveConfigs(POOL_PROVIDER, RESERVES, proposer);

    for (let x = 0; x < reserveConfigs.length; x++) {
      const { tokenAddress, symbol } = reserveConfigs[x];
      const { lTokenAddress, variableDebtTokenAddress } = await pool.getReserveData(
        reserveConfigs[x].tokenAddress
      );
      const lToken = IERC20DetailedFactory.connect(lTokenAddress, proposer);
      const varDebtToken = IERC20DetailedFactory.connect(variableDebtTokenAddress, proposer);

      symbols[symbol] = {
        lToken: {
          name: await lToken.name(),
          symbol: await lToken.symbol(),
        },
        variableDebtToken: {
          name: await varDebtToken.name(),
          symbol: await varDebtToken.symbol(),
        },
      };
    }
  });

  it('Proposal should be executed', async () => {
    const impersonateExecutor = await ethers.provider.getSigner(STARLAY_SHORT_EXECUTOR);

    const executionPayload = ProposalIncentivesExecutorFactory.connect(
      proposalExecutionPayload,
      impersonateExecutor
    );
    try {
      await (
        await executionPayload.execute(lTokensImpl, variableDebtTokensImpl, {
          gasLimit: 6000000,
        })
      ).wait();
    } catch (error) {
      if (DRE.network.name.includes('tenderly')) {
        const transactionLink = `https://dashboard.tenderly.co/${DRE.config.tenderly.username}/${
          DRE.config.tenderly.project
        }/fork/${DRE.tenderly.network().getFork()}/simulation/${DRE.tenderly.network().getHead()}`;
        console.error(
          '[TENDERLY] Transaction Reverted. Check TX simulation error at:',
          transactionLink
        );
      }
      throw error;
    }
  });

  it('Check emission rate', async () => {
    const incentives = StakedTokenIncentivesControllerFactory.connect(incentivesProxy, proposer);
    const tokenAddress = DAI_TOKEN;
    const { lTokenAddress, variableDebtTokenAddress } = await pool.getReserveData(tokenAddress);
    const reserve = IERC20Factory.connect(tokenAddress, proposer);

    // Amounts
    const depositAmount = parseEther('10000');

    // Deposit to LendingPool
    await (await reserve.connect(proposer).approve(pool.address, '0')).wait();
    await (await reserve.connect(proposer).approve(pool.address, depositAmount)).wait();
    await (
      await pool.connect(proposer).deposit(reserve.address, depositAmount, proposer.address, 0)
    ).wait();

    // Check unclaimed rewards before time travel and claim
    const unclaimedRewardsBefore = await incentives.getRewardsBalance(
      [lTokenAddress],
      proposer.address
    );

    await increaseTime(86400);

    const lTokenBalance = await ILTokenFactory.connect(lTokenAddress, proposer).scaledBalanceOf(
      proposer.address
    );
    const priorStkBalance = await IERC20Factory.connect(stakedLay.address, proposer).balanceOf(
      proposer.address
    );
    const userIndexBefore = await getUserIndex(incentives, proposer.address, lTokenAddress);

    // Claim after timetravel
    const tx2 = await incentives
      .connect(proposer)
      .claimRewards([lTokenAddress], MAX_UINT_AMOUNT, proposer.address);

    expect(tx2).to.emit(incentives, 'RewardsClaimed');
    const afterStkBalance = await stakedLay.balanceOf(proposer.address);
    const claimed = afterStkBalance.sub(priorStkBalance);

    const userIndexAfter = await getUserIndex(incentives, proposer.address, lTokenAddress);
    const expectedAccruedRewards = getRewards(
      lTokenBalance,
      userIndexAfter,
      userIndexBefore
    ).toString();

    // Expected rewards by index + prior accrued rewards
    const expectedClaimedRewards = BigNumber.from(expectedAccruedRewards).add(
      unclaimedRewardsBefore
    );

    expect(afterStkBalance).to.be.gt(priorStkBalance);
    expect(claimed).to.be.eq(expectedClaimedRewards);
  });

  xit('Users should be able to deposit DAI at Lending Pool', async () => {
    // Deposit DAI to LendingPool
    await (await dai.connect(proposer).approve(pool.address, parseEther('2000'))).wait();

    const tx = await pool.deposit(dai.address, parseEther('100'), proposer.address, 0);
    expect(tx).to.emit(pool, 'Deposit');
    expect(await lDAI.balanceOf(proposer.address)).to.be.gte(parseEther('100'));
  });

  xit('Users should be able to request DAI loan from Lending Pool', async () => {
    // Request DAI loan to LendingPool
    const tx = await pool.borrow(dai.address, parseEther('1'), '2', '0', proposer.address);
    expect(tx).to.emit(pool, 'Borrow');
    expect(await variableDebtDAI.balanceOf(proposer.address)).to.be.eq(parseEther('1'));
  });

  xit('Users should be able to repay DAI loan from Lending Pool', async () => {
    const {
      configuration: { data },
      variableDebtTokenAddress,
    } = await pool.getReserveData(DAI_TOKEN);

    // Repay DAI variable loan to LendingPool
    await (await dai.connect(proposer).approve(pool.address, MAX_UINT_AMOUNT)).wait();
    const tx = await pool.repay(dai.address, MAX_UINT_AMOUNT, '2', proposer.address);
    expect(tx).to.emit(pool, 'Repay');
  });

  xit('Users should be able to withdraw DAI from Lending Pool', async () => {
    const {
      configuration: { data },
      lTokenAddress,
    } = await pool.getReserveData(DAI_TOKEN);

    // Withdraw DAI from LendingPool
    const priorDAIBalance = await dai.balanceOf(proposer.address);
    await (await lDAI.connect(proposer).approve(pool.address, MAX_UINT_AMOUNT)).wait();
    const tx = await pool.withdraw(dai.address, MAX_UINT_AMOUNT, proposer.address);
    expect(tx).to.emit(pool, 'Withdraw');
    const afterDAIBalance = await dai.balanceOf(proposer.address);
    expect(await lDAI.balanceOf(proposer.address)).to.be.eq('0');
    expect(afterDAIBalance).to.be.gt(priorDAIBalance);
  });

  xit('User should be able to interact with LendingPool with DAI/GUSD/USDC/USDT/WBTC/WETH', async () => {
    const reserveConfigs = await getReserveConfigs(POOL_PROVIDER, RESERVES, proposer);

    // Deposit Starlay to LendingPool to have enought collateral for future borrows
    await (await layToken.connect(proposer).approve(pool.address, parseEther('1000'))).wait();
    await (
      await pool.connect(proposer).deposit(layToken.address, parseEther('1000'), proposer.address, 0)
    ).wait();

    for (let x = 0; x < reserveConfigs.length; x++) {
      const { symbol, tokenAddress } = reserveConfigs[x];
      await fullCycleLendingPool(symbol, tokenAddress, proposer, pool);
    }
  });

  xit('Check all lToken symbols and debt token matches', async () => {
    const reserveConfigs = await getReserveConfigs(POOL_PROVIDER, RESERVES, proposer);

    for (let x = 0; x < reserveConfigs.length; x++) {
      const { tokenAddress, symbol } = reserveConfigs[x];
      const { lTokenAddress, variableDebtTokenAddress } = await pool.getReserveData(tokenAddress);
      const lToken = IERC20DetailedFactory.connect(lTokenAddress, proposer);
      const varDebtToken = IERC20DetailedFactory.connect(variableDebtTokenAddress, proposer);

      const lTokenDetails = {
        name: await lToken.name(),
        symbol: await lToken.symbol(),
      };
      const variableDebtTokenDetails = {
        name: await varDebtToken.name(),
        symbol: await varDebtToken.symbol(),
      };

      expect(lTokenDetails).to.be.deep.equal(symbols[symbol].lToken);
      expect(variableDebtTokenDetails).to.be.deep.equal(symbols[symbol].variableDebtToken);
    }
  });

  xit('Users should be able to claim incentives', async () => {
    // Initialize proxy for incentives controller
    const incentives = StakedTokenIncentivesControllerFactory.connect(incentivesProxy, proposer);
    const reserveConfigs = await getReserveConfigs(POOL_PROVIDER, RESERVES, proposer);

    for (let x = 0; x < reserveConfigs.length; x++) {
      const { tokenAddress, symbol } = reserveConfigs[x];
      const { lTokenAddress, variableDebtTokenAddress } = await pool.getReserveData(
        reserveConfigs[x].tokenAddress
      );
      const reserve = IERC20Factory.connect(tokenAddress, proposer);

      // Amounts
      const depositAmount = parseUnits(spendList[symbol].deposit, spendList[symbol].decimals);

      // Deposit to LendingPool
      await (await reserve.connect(proposer).approve(pool.address, '0')).wait();
      await (await reserve.connect(proposer).approve(pool.address, depositAmount)).wait();
      const depositTx = await (
        await pool.connect(proposer).deposit(reserve.address, depositAmount, proposer.address, 0)
      ).wait();

      await increaseTime(86400);

      const priorBalance = await stakedLay.balanceOf(proposer.address);
      const tx = await incentives
        .connect(proposer)
        .claimRewards([lTokenAddress, variableDebtTokenAddress], MAX_UINT_AMOUNT, proposer.address);
      await tx.wait();
      expect(tx).to.emit(incentives, 'RewardsClaimed');

      const afterBalance = await stakedLay.balanceOf(proposer.address);
      expect(afterBalance).to.be.gt(priorBalance);
    }
  });

  xit('User should be able to interact with LendingPool with DAI/GUSD/USDC/USDT/WBTC/WETH', async () => {
    const incentives = StakedTokenIncentivesControllerFactory.connect(incentivesProxy, proposer);
    const distributionEnd = await incentives.getDistributionEnd();

    const { timestamp } = await DRE.ethers.provider.getBlock('latest');
    const timeLeft = Number(distributionEnd.sub(timestamp.toString()).toString());

    await increaseTime(timeLeft + 1);

    const reserveConfigs = await getReserveConfigs(POOL_PROVIDER, RESERVES, proposer);

    for (let x = 0; x < reserveConfigs.length; x++) {
      const { symbol, tokenAddress } = reserveConfigs[x];
      const { lTokenAddress, variableDebtTokenAddress } = await pool.getReserveData(tokenAddress);
      // Claim any leftovers
      await (
        await incentives
          .connect(proposer)
          .claimRewards(
            [lTokenAddress, variableDebtTokenAddress],
            MAX_UINT_AMOUNT,
            proposer.address
          )
      ).wait();

      // Do full cycle of actions at Lending Pool
      await fullCycleLendingPool(symbol, tokenAddress, proposer, pool);
    }
  });
});
