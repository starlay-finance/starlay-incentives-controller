import { ERC20__factory } from './../../types/factories/ERC20__factory';
import { PullRewardsIncentivesControllerV2__factory } from './../../types/factories/PullRewardsIncentivesControllerV2__factory';
import { task } from 'hardhat/config';
import {
  getIncentivesConfigPerNetwork,
  getLayTokenPerNetwork,
  getRewardVaultPerNetwork,
  getTokenAddressPerNetwork,
} from '../../helpers/constants';
import { eNetwork } from '../../helpers/types';
import { Wallet } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';
import { getEthersSigners } from '../../helpers/contracts-helpers';
import { parseEther } from 'ethers/lib/utils';
require('dotenv').config();

task('migrate-incentives-to-new-vault', 'Migrate incentives to new vault').setAction(
  async ({}, localBRE) => {
    // TODO: rpc url by environments
    await localBRE.run('set-DRE');
    //const EMISSION_MANAGER_PRIVATE_KEY = process.env.EMISSION_MANAGER_PRIVATE_KEY || '';
    //if (!EMISSION_MANAGER_PRIVATE_KEY) {
    //  throw new Error('emission manager private key is empty');
    //}

    //const provider = new JsonRpcProvider('https://rpc.astar.network:8545');
    const [, emissionManager] = await getEthersSigners();
    //const emissionManager = new Wallet(EMISSION_MANAGER_PRIVATE_KEY, provider);
    const network = localBRE.network.name as eNetwork;
    const { incentiveControllerProxy } = getIncentivesConfigPerNetwork(network);
    const addresses = getTokenAddressPerNetwork(network);
    const incentivesController = PullRewardsIncentivesControllerV2__factory.connect(
      incentiveControllerProxy,
      emissionManager
    );
    const rewards = await incentivesController.getUserUnclaimedRewards(
      '0xE5b0710729AC8126C48afff9AB857DCC09886fEc'
    );
    console.log('rewards:', rewards.toString());
    //await incentivesController.migrate();
    const layToken = getLayTokenPerNetwork(network);

    console.log(
      'balance before:',
      (
        await ERC20__factory.connect(layToken, emissionManager).balanceOf(
          await emissionManager.getAddress()
        )
      ).toString()
    );
    console.log('reward token: ', await incentivesController.REWARD_TOKEN());
    console.log('lay token: ', layToken);
    const vault = await getRewardVaultPerNetwork(network);
    await incentivesController.setRewardsVault(vault);
    console.log(
      'vault amount:',
      await ERC20__factory.connect(layToken, emissionManager).balanceOf(vault)
    );
    console.log('vault:', vault);
    await incentivesController
      .connect(emissionManager)
      .claimRewardsToSelf(
        [
          addresses.LAY,
          addresses.USDC,
          addresses.USDT,
          addresses.WASTR,
          addresses.WBTC,
          addresses.WETH,
          addresses.WSDN,
        ],
        parseEther('1')
      );
    console.log(
      'balance after:',
      (
        await ERC20__factory.connect(layToken, emissionManager).balanceOf(
          '0x50414Ac6431279824df9968855181474c919a94B'
        )
      ).toString()
    );
  }
);
