import { waitForTx } from '../../helpers/misc-utils';
import { task } from 'hardhat/config';
import { getIncentivesConfigPerNetwork } from '../../helpers/constants';
import { eNetwork } from '../../helpers/types';
import { Wallet } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';
import { getParamPerNetwork } from '../../helpers/contracts-helpers';
import { NETWORKS_RPC_URL } from '../../helper-hardhat-config';
import { PullRewardsIncentivesControllerV5__factory } from '../../types';
require('dotenv').config();

task('update-emission', 'Update emissionIn30days').setAction(async ({}, localBRE) => {
  await localBRE.run('set-DRE');
  const networkName = localBRE.network.name as eNetwork;
  const EMISSION_MANAGER_PRIVATE_KEY = process.env.EMISSION_MANAGER_PRIVATE_KEY || '';
  if (!EMISSION_MANAGER_PRIVATE_KEY) {
    throw new Error('emission manager private key is empty');
  }
  const provider = new JsonRpcProvider(getParamPerNetwork(NETWORKS_RPC_URL, networkName));

  const emissionManager = new Wallet(EMISSION_MANAGER_PRIVATE_KEY, provider);
  const network = localBRE.network.name as eNetwork;
  const { incentiveControllerProxy, emissionIn30Days } = getIncentivesConfigPerNetwork(network);
  if (!emissionIn30Days) {
    throw new Error('emissionIn30Days is not defined');
  }
  console.log(`[PullRewardsIncentivesControllerV5] Update emissionIn30Days:`);
  console.log(`  - Network name: ${networkName}`);
  const incentivesControllerProxy = PullRewardsIncentivesControllerV5__factory.connect(
    incentiveControllerProxy,
    emissionManager
  );
  const tx = await incentivesControllerProxy.setEmissionIn30Days(emissionIn30Days);
  await waitForTx(tx);
});
