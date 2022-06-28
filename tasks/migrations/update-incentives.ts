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
    if (!EMISSION_MANAGER_PRIVATE_KEY) {
      throw new Error('emission manager private key is empty');
    }
    const provider = new JsonRpcProvider('https://evm.astar.network');
    const emissionManager = new Wallet(EMISSION_MANAGER_PRIVATE_KEY, provider);
    const network = localBRE.network.name as eNetwork;
    const lTokens = getlTokenAddressPerNetwork(network);
    const variableDebtTokens = getVdTokenAddressPerNetwork(network);
    const { incentiveControllerProxy } = getIncentivesConfigPerNetwork(network);

    const emmissionsPerAssets = {
      [lTokens.WASTR]: '165039621913580246',
      [variableDebtTokens.WASTR]: '385092451131687242',
      [lTokens.USDC]: '165039621913580246',
      [variableDebtTokens.USDC]: '385092451131687242',
      [lTokens.USDT]: '165039621913580246',
      [variableDebtTokens.USDT]: '385092451131687242',
      [lTokens.WETH]: '82519810956790123',
      [variableDebtTokens.WETH]: '192546225565843621',
      [lTokens.WBTC]: '82519810956790123',
      [variableDebtTokens.WBTC]: '192546225565843621',
      [lTokens.WSDN]: '82519810956790123',
      [variableDebtTokens.WSDN]: '192546225565843621',
      [lTokens.DAI]: '165039621913580246',
      [variableDebtTokens.DAI]: '385092451131687242',
      [lTokens.BUSD]: '165039621913580246',
      [variableDebtTokens.BUSD]: '385092451131687242',
      [lTokens.MATIC]: '82519810956790123',
      [variableDebtTokens.MATIC]: '192546225565843621',
      [lTokens.BNB]: '82519810956790123',
      [variableDebtTokens.BNB]: '192546225565843621',
      [lTokens.DOT]: '1237797164351851851',
      [variableDebtTokens.DOT]: '2888193383487654320',
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
    const tx = await incentivesControllerInstance.configureAssets(
      Object.keys(emmissionsPerAssets),
      Object.values(emmissionsPerAssets),
      {
        gasPrice: 1000 * 1000 * 1000 * 100,
      }
    );
    console.log(tx);

    await waitForTx(tx);
    console.log('set distribution end');
    const distEndTx = await waitForTx(
      await incentivesControllerInstance.setDistributionEnd(
        // 13/7/2022 11:00:00
        1657710000,
        { gasPrice: 1000 * 1000 * 1000 * 100 }
      )
    ); //current + seconds per month
    console.log(distEndTx);
    console.log(
      'new distribution end:',
      (await incentivesControllerInstance.connect(emissionManager).DISTRIBUTION_END()).toNumber()
    );
  }
);
