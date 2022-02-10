import { task } from 'hardhat/config';
import { DRE } from '../../helpers/misc-utils';
import { tEthereumAddress } from '../../helpers/types';
import { getReserveConfigs } from '../../test-fork/helpers';
import { ProposalIncentivesExecutor__factory, IERC20Detailed__factory } from '../../types';
import { ILendingPool } from '../../types/ILendingPool';
import { getDefenderRelaySigner } from '../../helpers/defender-utils';
import { Signer } from 'ethers';
import kebabCase from 'kebab-case';

const {
  RESERVES = 'DAI,GUSD,USDC,USDT,WBTC,WETH',
  POOL_PROVIDER = '0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5',
  POOL_DATA_PROVIDER = '0x057835Ad21a177dbdd3090bB1CAE03EaCF78Fc6d',
  TREASURY = '0x464c71f6c2f760dda6093dcb91c24c39e5d6e18c',
} = process.env;

const INCENTIVES_PROXY = '0xd784927Ff2f95ba542BfC824c8a8a98F3495f6b5';

task(
  'incentives-deploy:mainnet',
  'Deploy the payload contract, ltokens and variable debt token implementations. Print the params for submitting proposal'
)
  .addFlag('defender')
  .setAction(async ({ defender }, localBRE) => {
    let lTokensImpl: tEthereumAddress[];
    let variableDebtTokensImpl: tEthereumAddress[];
    let proposalExecutionPayload: tEthereumAddress;
    let symbols: {
      [key: string]: {
        aToken: { symbol: string; name: string };
        variableDebtToken: { symbol: string; name: string };
      };
    } = {};

    await localBRE.run('set-DRE');

    let deployer: Signer;
    [deployer] = await DRE.ethers.getSigners();

    if (defender) {
      const { signer } = await getDefenderRelaySigner();
      deployer = signer;
    }

    const ethers = DRE.ethers;

    const incentivesProxy = INCENTIVES_PROXY;

    if (
      !RESERVES ||
      !POOL_DATA_PROVIDER ||
      !TREASURY
    ) {
      throw new Error('You have not set correctly the .env file, make sure to read the README.md');
    }

    console.log('- Deploying lTokens and Variable Debt Tokens implementations');

    // Deploy lTokens and debt tokens
    const { lTokens, variableDebtTokens } = await DRE.run('deploy-reserve-implementations', {
      provider: POOL_PROVIDER,
      assets: RESERVES,
      incentivesController: incentivesProxy,
      treasury: TREASURY,
      defender: true,
    });

    lTokensImpl = [...lTokens];
    variableDebtTokensImpl = [...variableDebtTokens];

    // Deploy Proposal Executor Payload
    const {
      address: proposalExecutionPayloadAddress,
    } = await new ProposalIncentivesExecutor__factory(deployer).deploy();
    proposalExecutionPayload = proposalExecutionPayloadAddress;

    console.log('Deployed ProposalIncentivesExecutor at:', proposalExecutionPayloadAddress);

    console.log('- Finished deployment script');

    console.log('=== INFO ===');
    console.log('Proposal payload:', proposalExecutionPayloadAddress);
    console.log('Incentives Controller proxy:', incentivesProxy);
    console.log(
      'Needed params to submit the proposal at the following task: ',
      '$ npx hardhat --network main incentives-submit-proposal:mainnet'
    );
    const proposalParams = {
      proposalExecutionPayload,
      aTokens: lTokensImpl.join(','),
      variableDebtTokens: variableDebtTokensImpl.join(','),
    };
    console.log(
      `--defender `,
      Object.keys(proposalParams)
        .map((str) => `--${kebabCase(str)} ${proposalParams[str]}`)
        .join(' ')
    );

    await DRE.run('verify-proposal-etherscan', {
      assets: RESERVES,
      aTokens: lTokensImpl.join(','),
      variableDebtTokens: variableDebtTokensImpl.join(','),
      proposalPayloadAddress: proposalExecutionPayloadAddress,
    });
  });
