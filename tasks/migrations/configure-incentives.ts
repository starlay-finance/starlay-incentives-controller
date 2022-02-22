import { IncentivesExecutor__factory } from '../../types/factories/IncentivesExecutor__factory';
import { task } from 'hardhat/config';
import { DRE } from '../../helpers/misc-utils';
import { getDefenderRelaySigner } from '../../helpers/defender-utils';
import { Signer } from '@ethersproject/abstract-signer';
import {
  getlTokenAddressPerNetwork,
  getVdTokenAddressPerNetwork,
  getTokenAddressPerNetwork,
} from '../../helpers/constants';
import { eNetwork } from '../../helpers/types';

task('configure-incentives', 'Configure incentives for next 30 days')
  .addFlag('defender')
  .addParam('executor')
  .setAction(async ({ defender, executor }, localBRE) => {
    await localBRE.run('set-DRE');
    let executorOwner: Signer;
    [executorOwner] = await DRE.ethers.getSigners();

    if (defender) {
      const { signer } = await getDefenderRelaySigner();
      executorOwner = signer;
    }
    const network = localBRE.network.name as eNetwork;
    const lTokens = getlTokenAddressPerNetwork(network);
    const variableDebtTokens = getVdTokenAddressPerNetwork(network);
    const reserves = getTokenAddressPerNetwork(network);
    if (!executor) {
      throw new Error('You have not set correctly executor');
    }

    const executorInstance = IncentivesExecutor__factory.connect(executor, executorOwner);

    const tx = await executorInstance.execute(
      [lTokens.WASTR, lTokens.USDC, lTokens.USDT, lTokens.WETH, lTokens.WBTC, lTokens.WSDN],
      [
        variableDebtTokens.WASTR,
        variableDebtTokens.USDC,
        variableDebtTokens.USDT,
        variableDebtTokens.WETH,
        variableDebtTokens.WBTC,
        variableDebtTokens.WSDN,
      ],
      [reserves.USDC, reserves.USDT, reserves.WASTR, reserves.WETH, reserves.WBTC, reserves.WSDN]
    );
    console.log(`incentive configuration completed at ${tx.hash}`);
  });
