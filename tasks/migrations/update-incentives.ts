import { spendList } from './../../test-fork/helpers';
import { IIncentivesController__factory } from '../../types/factories/IIncentivesController__factory';
import { task } from 'hardhat/config';
import { DRE } from '../../helpers/misc-utils';
import { getDefenderRelaySigner } from '../../helpers/defender-utils';
import { Signer } from '@ethersproject/abstract-signer';
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

task('update-incentives', 'Configure incentives for next 30 days').setAction(
  async ({}, localBRE) => {
    await localBRE.run('set-DRE');
    const signers = await DRE.ethers.getSigners();
    const vaultOwner = signers[0];
    const emissionManager = signers[9];

    const network = localBRE.network.name as eNetwork;
    const lTokens = getlTokenAddressPerNetwork(network);
    const variableDebtTokens = getVdTokenAddressPerNetwork(network);

    const { rewardsVault, incentiveControllerProxy } = getIncentivesConfigPerNetwork(network);

    const emmissionsPerAssets = {
      [lTokens.WASTR]: '808542052469135802',
      [variableDebtTokens.WASTR]: '1886598379629629629',
      [lTokens.USDC]: '808542052469135802',
      [variableDebtTokens.USDC]: '1886598379629629629',
      [lTokens.USDT]: '808542052469135802',
      [variableDebtTokens.USDT]: '1886598379629629629',
      [lTokens.WETH]: '539028163580246913',
      [variableDebtTokens.WETH]: '1886598379629629629',
      [lTokens.WBTC]: '539028163580246913',
      [variableDebtTokens.WBTC]: '1886598379629629629',
      [lTokens.WSDN]: '269513888888888888',
      [variableDebtTokens.WSDN]: '628866126543209876',
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
    await vaultInstance.transfer(lay, parseEther('17325200'));
    await incentivesControllerInstance.configureAssets(
      Object.keys(emmissionsPerAssets),
      Object.values(emmissionsPerAssets)
    );
    console.log('set distribution end');
    await incentivesControllerInstance.setDistributionEnd((await getBlockTimestamp()) + 2592000); //current + seconds per month
  }
);
