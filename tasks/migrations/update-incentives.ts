import { task } from 'hardhat/config';
import { DRE, waitForTx } from '../../helpers/misc-utils';
import {
  getlTokenAddressPerNetwork,
  getVdTokenAddressPerNetwork,
  getTokenAddressPerNetwork,
  getIncentivesConfigPerNetwork,
} from '../../helpers/constants';
import { eNetwork } from '../../helpers/types';
import {
  IStarlayRewardsVault__factory,
  PullRewardsIncentivesController__factory,
} from '../../types';
import {
  getBlockTimestamp,
  getEthersSigners,
  getFirstSigner,
} from '../../helpers/contracts-helpers';
import { parseEther } from 'ethers/lib/utils';
import { BigNumber, Wallet } from 'ethers';
import { ethers } from 'hardhat';
import { JsonRpcProvider } from '@ethersproject/providers';
import { arrayContainsArray } from 'ethjs-util';
require('dotenv').config();

task('update-incentives', 'Configure incentives for next 30 days').setAction(
  async ({}, localBRE) => {
    // TODO: rpc url by environments
    await localBRE.run('set-DRE');
    const EMISSION_MANAGER_PRIVATE_KEY = process.env.EMISSION_MANAGER_PRIVATE_KEY || '';
    const VAULT_OWNER_PRIVATE_KEY = process.env.VAULT_OWNER_PRIVATE_KEY || '';
    if (!EMISSION_MANAGER_PRIVATE_KEY) {
      throw new Error('emission manager private key is empty');
    }
    if (!VAULT_OWNER_PRIVATE_KEY) {
      throw new Error('vault private key is empty');
    }
    const provider = new JsonRpcProvider('https://astar.api.onfinality.io/public');
    const emissionManager = new Wallet(EMISSION_MANAGER_PRIVATE_KEY, provider);
    //const [, emissionManager] = await getEthersSigners();
    const network = localBRE.network.name as eNetwork;
    const lTokens = getlTokenAddressPerNetwork(network);
    const variableDebtTokens = getVdTokenAddressPerNetwork(network);
    const { incentiveControllerProxy } = getIncentivesConfigPerNetwork(network);

    const emmissionsPerAssets = {
      [lTokens.WASTR]: '171916276041666666',
      [variableDebtTokens.WASTR]: '401137977430555555',
      [lTokens.USDC]: '343832552083333333',
      [variableDebtTokens.USDC]: '802275954861111111',
      [lTokens.USDT]: '343832552083333333',
      [variableDebtTokens.USDT]: '802275954861111111',
      [lTokens.WETH]: '515748828125000000',
      [variableDebtTokens.WETH]: '1203413932291666666',
      [lTokens.WBTC]: '171916276041666666',
      [variableDebtTokens.WBTC]: '401137977430555555',
      [lTokens.WSDN]: '171916276041666666',
      [variableDebtTokens.WSDN]: '401137977430555555',
      [lTokens.DAI]: '343832552083333333',
      [variableDebtTokens.DAI]: '802275954861111111',
      [lTokens.BUSD]: '343832552083333333',
      [variableDebtTokens.BUSD]: '802275954861111111',
      [lTokens.MATIC]: '171916276041666666',
      [variableDebtTokens.MATIC]: '401137977430555555',
      [lTokens.BNB]: '171916276041666666',
      [variableDebtTokens.BNB]: '401137977430555555',
    };

    const incentivesControllerInstance = PullRewardsIncentivesController__factory.connect(
      incentiveControllerProxy,
      emissionManager
    );
    console.log('dist end');
    console.log(
      await (
        await incentivesControllerInstance.connect(emissionManager).DISTRIBUTION_END()
      ).toNumber()
    );
    console.log('em:', await incentivesControllerInstance.EMISSION_MANAGER());

    const configurationTx = await waitForTx(
      await incentivesControllerInstance.configureAssets(
        Object.keys(emmissionsPerAssets),
        Object.values(emmissionsPerAssets)
      )
    );
    console.log(configurationTx);

    console.log('set distribution end');
    const distEndTx = await waitForTx(
      await incentivesControllerInstance.setDistributionEnd(
        (await getBlockTimestamp()) + 60 * 60 * 24 * 7
      )
    ); //current + seconds per week
    console.log(distEndTx);
  }
);
