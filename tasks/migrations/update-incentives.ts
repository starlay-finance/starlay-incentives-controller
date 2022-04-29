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
    const emissionTotal = parseEther('26406340');

    const emmissionsPerAssets = {
      [lTokens.WASTR]: '191018084490740000',
      [variableDebtTokens.WASTR]: '445708863811728000',
      [lTokens.USDC]: '382036168981481000',
      [variableDebtTokens.USDC]: '891417727623456000',
      [lTokens.USDT]: '382036168981481000',
      [variableDebtTokens.USDT]: '891417727623456000',
      [lTokens.WETH]: '573054253472222000',
      [variableDebtTokens.WETH]: '1337126591435180000',
      [lTokens.WBTC]: '191018084490740000',
      [variableDebtTokens.WBTC]: '445708863811728000',
      [lTokens.WSDN]: '191018084490740000',
      [variableDebtTokens.WSDN]: '445708863811728000',
      [lTokens.DAI]: '382036168981481000',
      [variableDebtTokens.DAI]: '891417727623456000',
      [lTokens.BUSD]: '382036168981481000',
      [variableDebtTokens.BUSD]: '891417727623456000',
      [lTokens.MATIC]: '191018084490740000',
      [variableDebtTokens.MATIC]: '445708863811728000',
      [lTokens.BNB]: '191018084490740000',
      [variableDebtTokens.BNB]: '445708863811728000',
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
        (await getBlockTimestamp()) + 60 * 60 * 24 * 30
      )
    ); //current + seconds per month
    console.log(distEndTx);
  }
);
