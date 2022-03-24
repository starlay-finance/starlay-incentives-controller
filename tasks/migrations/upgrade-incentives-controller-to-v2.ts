import { waitForTx } from '../../helpers/misc-utils';
import { InitializableAdminUpgradeabilityProxy__factory } from '../../types/factories/InitializableAdminUpgradeabilityProxy__factory';
import { task } from 'hardhat/config';
import {
  getlTokenAddressPerNetwork,
  getVdTokenAddressPerNetwork,
  getIncentivesConfigPerNetwork,
  getStakedTokenPerNetwork,
} from '../../helpers/constants';
import { eNetwork } from '../../helpers/types';
import { isAddress } from 'ethers/lib/utils';
import { Wallet } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';
import { deployPullRewardsIncentivesControllerV2 } from '../../helpers/contracts-accessors';
require('dotenv').config();

task(
  'upgrade-incentives-controller-to-v2',
  'Upgrade PullRewardsIncentivesController to V2'
).setAction(async ({}, localBRE) => {
  // TODO: rpc url by environments
  await localBRE.run('set-DRE');
  const networkName = localBRE.network.name as eNetwork;
  const EMISSION_MANAGER_PRIVATE_KEY = process.env.EMISSION_MANAGER_PRIVATE_KEY || '';
  const INCENTIVES_CONTROLLER_ADMIN_PRIVATE_KEY =
    process.env.INCENTIVES_CONTROLLER_ADMIN_PRIVATE_KEY || '';
  if (!EMISSION_MANAGER_PRIVATE_KEY) {
    throw new Error('emission manager private key is empty');
  }
  if (!INCENTIVES_CONTROLLER_ADMIN_PRIVATE_KEY) {
    throw new Error('vault private key is empty');
  }
  const rewardToken = getStakedTokenPerNetwork(networkName);
  if (!isAddress(rewardToken)) {
    throw Error('Missing or incorrect rewardToken param');
  }
  const provider = new JsonRpcProvider('https://rpc.astar.network:8545');

  const emissionManager = new Wallet(EMISSION_MANAGER_PRIVATE_KEY, provider);
  const admin = new Wallet(INCENTIVES_CONTROLLER_ADMIN_PRIVATE_KEY, provider);
  const network = localBRE.network.name as eNetwork;
  const lTokens = getlTokenAddressPerNetwork(network);
  const variableDebtTokens = getVdTokenAddressPerNetwork(network);
  const { rewardsVault, incentiveControllerProxy } = getIncentivesConfigPerNetwork(network);
  console.log(`[PullRewardsIncentivesControllerV2] Starting deployment:`);
  console.log(`  - Network name: ${networkName}`);
  const incentivesControllerV2Impl = await deployPullRewardsIncentivesControllerV2([rewardToken]);
  console.log(`  - Deployed implementation of PullRewardsIncentivesControllerV2`);

  const encodeParams = incentivesControllerV2Impl.interface.encodeFunctionData('initialize', [
    rewardsVault,
    emissionManager.address,
  ]);
  const incentivesControllerProxy = InitializableAdminUpgradeabilityProxy__factory.connect(
    incentiveControllerProxy,
    admin
  );
  await waitForTx(
    await incentivesControllerProxy.upgradeToAndCall(
      incentivesControllerV2Impl.address,
      encodeParams
    )
  );
});
