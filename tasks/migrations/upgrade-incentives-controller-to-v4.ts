import { getLayTokenPerNetwork } from '../../helpers/constants';
import { waitForTx } from '../../helpers/misc-utils';
import { InitializableAdminUpgradeabilityProxy__factory } from '../../types/factories/InitializableAdminUpgradeabilityProxy__factory';
import { task } from 'hardhat/config';
import { getIncentivesConfigPerNetwork } from '../../helpers/constants';
import { eNetwork } from '../../helpers/types';
import { isAddress } from 'ethers/lib/utils';
import { Wallet } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';
import {
  deployPullRewardsIncentivesControllerV4,
} from '../../helpers/contracts-accessors';
import { getParamPerNetwork } from '../../helpers/contracts-helpers';
import { NETWORKS_RPC_URL } from '../../helper-hardhat-config';
require('dotenv').config();

task(
  'upgrade-incentives-controller-to-v4',
  'Upgrade PullRewardsIncentivesController to V4'
).setAction(async ({}, localBRE) => {
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
  const rewardToken = getLayTokenPerNetwork(networkName);
  if (!isAddress(rewardToken)) {
    throw Error('Missing or incorrect rewardToken param');
  }
  const provider = new JsonRpcProvider(getParamPerNetwork(NETWORKS_RPC_URL, networkName));

  const emissionManager = new Wallet(EMISSION_MANAGER_PRIVATE_KEY, provider);
  const admin = new Wallet(INCENTIVES_CONTROLLER_ADMIN_PRIVATE_KEY, provider);
  const network = localBRE.network.name as eNetwork;
  const { rewardsVault, lendingPool, voter, incentiveControllerProxy } =
    getIncentivesConfigPerNetwork(network);
  console.log(`[PullRewardsIncentivesControllerV3] Starting deployment:`);
  console.log(`  - Network name: ${networkName}`);
  const incentivesControllerV4Impl = await deployPullRewardsIncentivesControllerV4(rewardToken);
  console.log(
    `  - Deployed implementation of PullRewardsIncentivesControllerV4 at:`,
    incentivesControllerV4Impl.address
  );

  const encodeParams = incentivesControllerV4Impl.interface.encodeFunctionData('initialize', [
    rewardsVault,
    lendingPool,
    voter,
    emissionManager.address,
  ]);
  const incentivesControllerProxy = InitializableAdminUpgradeabilityProxy__factory.connect(
    incentiveControllerProxy,
    admin
  );

  await waitForTx(
    await incentivesControllerProxy.upgradeToAndCall(
      incentivesControllerV4Impl.address,
      encodeParams
    )
  );
});
