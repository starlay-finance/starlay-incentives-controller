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
    const provider = new JsonRpcProvider('https://evm.astar.network');
    const emissionManager = new Wallet(EMISSION_MANAGER_PRIVATE_KEY, provider);
    const network = localBRE.network.name as eNetwork;
    const lTokens = getlTokenAddressPerNetwork(network);
    const variableDebtTokens = getVdTokenAddressPerNetwork(network);
    const { incentiveControllerProxy } = getIncentivesConfigPerNetwork(network);

    const emmissionsPerAssets = {
      [lTokens.WASTR]: '211589262820512820',
      [variableDebtTokens.WASTR]: '493708279914529914',
      [lTokens.USDC]: '211589262820512820',
      [variableDebtTokens.USDC]: '493708279914529914',
      [lTokens.USDT]: '211589262820512820',
      [variableDebtTokens.USDT]: '493708279914529914',
      [lTokens.WETH]: '211589262820512820',
      [variableDebtTokens.WETH]: '493708279914529914',
      [lTokens.WBTC]: '105794631410256410',
      [variableDebtTokens.WBTC]: '246854139957264957',
      [lTokens.WSDN]: '105794631410256410',
      [variableDebtTokens.WSDN]: '246854139957264957',
      [lTokens.DAI]: '211589262820512820',
      [variableDebtTokens.DAI]: '493708279914529914',
      [lTokens.BUSD]: '211589262820512820',
      [variableDebtTokens.BUSD]: '493708279914529914',
      [lTokens.MATIC]: '105794631410256410',
      [variableDebtTokens.MATIC]: '246854139957264957',
      [lTokens.BNB]: '105794631410256410',
      [variableDebtTokens.BNB]: '246854139957264957',
      [lTokens.DOT]: '1057946314102564102',
      [variableDebtTokens.DOT]: '2468541399572649572',
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
        // 28/6/2022 18:00:00
        1656403200,
        { gasPrice: 1000 * 1000 * 1000 * 100 }
      )
    ); //current + seconds per week
    console.log(distEndTx);
  }
);
