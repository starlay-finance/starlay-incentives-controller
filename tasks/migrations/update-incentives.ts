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
import { getBlockTimestamp } from '../../helpers/contracts-helpers';
import { parseEther } from 'ethers/lib/utils';
import { Wallet } from 'ethers';
require('dotenv').config();

task('update-incentives', 'Configure incentives for next 30 days').setAction(
  async ({}, localBRE) => {
    await localBRE.run('set-DRE');
    const EMISSION_MANAGER_PRIVATE_KEY = process.env.EMISSION_MANAGER_PRIVATE_KEY || '';
    const VAULT_OWNER_PRIVATE_KEY = process.env.VAULT_OWNER_PRIVATE_KEY || '';
    if (EMISSION_MANAGER_PRIVATE_KEY) {
      throw new Error('emission manager private key is empty');
    }
    if (VAULT_OWNER_PRIVATE_KEY) {
      throw new Error('vault private key is empty');
    }
    const emissionManager = new Wallet(EMISSION_MANAGER_PRIVATE_KEY);
    const vaultOwner = new Wallet(VAULT_OWNER_PRIVATE_KEY);
    const network = localBRE.network.name as eNetwork;
    const lTokens = getlTokenAddressPerNetwork(network);
    const variableDebtTokens = getVdTokenAddressPerNetwork(network);

    const { rewardsVault, incentiveControllerProxy } = getIncentivesConfigPerNetwork(network);
    const emissionTotal = parseEther('32600420');
    const emmissionsPerAssets = {
      [lTokens.WASTR]: '943299189814814814',
      [variableDebtTokens.WASTR]: '104811021090534979',
      [lTokens.USDC]: '1886598379629629629',
      [variableDebtTokens.USDC]: '209622042181069958',
      [lTokens.USDT]: '1886598379629629629',
      [variableDebtTokens.USDT]: '209622042181069958',
      [lTokens.WETH]: '4716495949074074074',
      [variableDebtTokens.WETH]: '524055105452674897',
      [lTokens.WBTC]: '943299189814814814',
      [variableDebtTokens.WBTC]: '104811021090534979',
      [lTokens.WSDN]: '943299189814814814',
      [variableDebtTokens.WSDN]: '104811021090534979',
    };
    const lay = getTokenAddressPerNetwork(network).LAY;

    const incentivesControllerInstance = PullRewardsIncentivesController__factory.connect(
      incentiveControllerProxy,
      emissionManager
    );
    const vaultInstance = IStarlayRewardsVault__factory.connect(rewardsVault, vaultOwner);

    console.log('set incentives controller');
    await vaultInstance.setIncentiveController(incentiveControllerProxy);
    console.log('transfer LAY from vault to incentives controller');
    await vaultInstance.transfer(lay, emissionTotal);
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
