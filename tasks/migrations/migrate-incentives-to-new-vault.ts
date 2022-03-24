import { PullRewardsIncentivesControllerV2__factory } from './../../types/factories/PullRewardsIncentivesControllerV2__factory';
import { task } from 'hardhat/config';
import { getIncentivesConfigPerNetwork, getRewardVaultPerNetwork } from '../../helpers/constants';
import { eNetwork } from '../../helpers/types';
import { Wallet } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';
require('dotenv').config();

task('migrate-incentives-to-new-vault', 'Migrate incentives to new vault').setAction(
  async ({}, localBRE) => {
    // TODO: rpc url by environments
    await localBRE.run('set-DRE');
    const EMISSION_MANAGER_PRIVATE_KEY = process.env.EMISSION_MANAGER_PRIVATE_KEY || '';
    if (!EMISSION_MANAGER_PRIVATE_KEY) {
      throw new Error('emission manager private key is empty');
    }

    const provider = new JsonRpcProvider('https://rpc.astar.network:8545');

    const emissionManager = new Wallet(EMISSION_MANAGER_PRIVATE_KEY, provider);
    const network = localBRE.network.name as eNetwork;
    const { incentiveControllerProxy } = getIncentivesConfigPerNetwork(network);
    const incentivesController = PullRewardsIncentivesControllerV2__factory.connect(
      incentiveControllerProxy,
      emissionManager
    );
    await incentivesController.migrate();
  }
);
