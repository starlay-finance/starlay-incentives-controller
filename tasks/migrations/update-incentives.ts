import { task } from 'hardhat/config';
import { DRE } from '../../helpers/misc-utils';
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
import { getBlockTimestamp, getEthersSigners } from '../../helpers/contracts-helpers';
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
    const provider = new JsonRpcProvider('https://rpc.astar.network:8545');

    const emissionManager = new Wallet(EMISSION_MANAGER_PRIVATE_KEY, provider);
    const vaultOwner = new Wallet(VAULT_OWNER_PRIVATE_KEY, provider);
    const network = localBRE.network.name as eNetwork;
    const lTokens = getlTokenAddressPerNetwork(network);
    const variableDebtTokens = getVdTokenAddressPerNetwork(network);
    const { rewardsVault, incentiveControllerProxy } = getIncentivesConfigPerNetwork(network);
    const emissionTotal = parseEther('29340378');

    const emmissionsPerAssets = {
      [lTokens.WASTR]: '636726953125000000',
      [variableDebtTokens.WASTR]: '70747439236111111',
      [lTokens.USDC]: '1273453906250000000',
      [variableDebtTokens.USDC]: '141494878472222222',
      [lTokens.USDT]: '1273453906250000000',
      [variableDebtTokens.USDT]: '141494878472222222',
      [lTokens.WETH]: '3183634765625000000',
      [variableDebtTokens.WETH]: '353737196180555555',
      [lTokens.WBTC]: '636726953125000000',
      [variableDebtTokens.WBTC]: '70747439236111111',
      [lTokens.WSDN]: '636726953125000000',
      [variableDebtTokens.WSDN]: '70747439236111111',
      [lTokens.DAI]: '1273453906250000000',
      [variableDebtTokens.DAI]: '141494878472222222',
      [lTokens.BUSD]: '1273453906250000000',
      [variableDebtTokens.BUSD]: '141494878472222222',
    };
    const lay = getTokenAddressPerNetwork(network).LAY;

    const incentivesControllerInstance = PullRewardsIncentivesController__factory.connect(
      incentiveControllerProxy,
      emissionManager
    );
    console.log(await (await incentivesControllerInstance.DISTRIBUTION_END()).toNumber());
    const vaultInstance = IStarlayRewardsVault__factory.connect(rewardsVault, vaultOwner);
    console.log('vault owner', await vaultInstance.owner(), await emissionManager.getAddress());
    console.log('set incentives controller', incentiveControllerProxy);
    await vaultInstance.setIncentiveController(incentiveControllerProxy);
    console.log('transfer LAY from vault to incentives controller');
    await vaultInstance.transfer(lay, emissionTotal);
    console.log('configure assets');

    await incentivesControllerInstance.configureAssets(
      Object.keys(emmissionsPerAssets),
      Object.values(emmissionsPerAssets)
    );
    console.log('set distribution end');
    await incentivesControllerInstance.setDistributionEnd(
      (await getBlockTimestamp()) + 60 * 60 * 24 * 30
    ); //current + seconds per month
  }
);
