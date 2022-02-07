import rawBRE from 'hardhat';
import { Signer, ethers } from 'ethers';
import { getBlockTimestamp, getEthersSigners } from '../helpers/contracts-helpers';
import { initializeMakeSuite } from './helpers/make-suite';
import { deployMintableErc20, deployATokenMock } from '../helpers/contracts-accessors';
import { DRE, waitForTx } from '../helpers/misc-utils';
import { MintableErc20 } from '../types/MintableErc20';
import { testDeployIncentivesController } from './helpers/deploy';
import {
  PullRewardsIncentivesController__factory,
  StakedAaveV3__factory,
  StakedTokenIncentivesController__factory,
} from '../types';
import { parseEther } from '@ethersproject/units';
import { MAX_UINT_AMOUNT } from '../helpers/constants';

const topUpWalletsWithStarlay = async (
  wallets: Signer[],
  starlayToken: MintableErc20,
  amount: string
) => {
  for (const wallet of wallets) {
    await waitForTx(await starlayToken.connect(wallet).mint(amount));
  }
};

const buildTestEnv = async (
  deployer: Signer,
  vaultOfRewards: Signer,
  proxyAdmin: Signer,
  restWallets: Signer[]
) => {
  console.time('setup');

  const starlayToken = await deployMintableErc20(['Starlay', 'lay']);

  await waitForTx(await starlayToken.connect(vaultOfRewards).mint(ethers.utils.parseEther('2000000')));
  await topUpWalletsWithStarlay(
    [restWallets[0], restWallets[1], restWallets[2], restWallets[3], restWallets[4]],
    starlayToken,
    ethers.utils.parseEther('100').toString()
  );

  const { incentivesProxy, stakeProxy } = await testDeployIncentivesController(
    deployer,
    vaultOfRewards,
    proxyAdmin,
    starlayToken
  );
  const { proxy: baseIncentivesProxy } = await DRE.run('deploy-pull-rewards-incentives', {
    emissionManager: await deployer.getAddress(),
    rewardToken: starlayToken.address,
    rewardsVault: await vaultOfRewards.getAddress(),
    proxyAdmin: await proxyAdmin.getAddress(),
  });

  await waitForTx(
    await starlayToken.connect(vaultOfRewards).approve(baseIncentivesProxy, MAX_UINT_AMOUNT)
  );

  const distributionDuration = ((await getBlockTimestamp()) + 1000 * 60 * 60).toString();
  await deployATokenMock(incentivesProxy.address, 'lDai');
  await deployATokenMock(incentivesProxy.address, 'lWeth');

  await deployATokenMock(baseIncentivesProxy, 'lDaiBase');
  await deployATokenMock(baseIncentivesProxy, 'lWethBase');

  const incentivesController = StakedTokenIncentivesController__factory.connect(
    incentivesProxy.address,
    deployer
  );
  const pullRewardsIncentivesController = PullRewardsIncentivesController__factory.connect(
    baseIncentivesProxy,
    deployer
  );

  await incentivesController.setDistributionEnd(distributionDuration);
  await pullRewardsIncentivesController.setDistributionEnd(distributionDuration);
  await waitForTx(
    await starlayToken
      .connect(vaultOfRewards)
      .transfer(incentivesController.address, parseEther('1000000'))
  );

  console.timeEnd('setup');

  return {
    starlayToken,
    incentivesController,
    pullRewardsIncentivesController,
    starlayStake: StakedAaveV3__factory.connect(stakeProxy.address, deployer),
  };
};

before(async () => {
  await rawBRE.run('set-DRE');
  const [deployer, proxyAdmin, rewardsVault, ...restWallets] = await getEthersSigners();
  const {
    starlayToken,
    starlayStake,
    incentivesController,
    pullRewardsIncentivesController,
  } = await buildTestEnv(deployer, rewardsVault, proxyAdmin, restWallets);
  await initializeMakeSuite(
    starlayToken,
    starlayStake,
    incentivesController,
    pullRewardsIncentivesController
  );
  console.log('\n***************');
  console.log('Setup and snapshot finished');
  console.log('***************\n');
});
