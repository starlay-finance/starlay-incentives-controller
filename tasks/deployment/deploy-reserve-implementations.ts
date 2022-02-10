import { task } from 'hardhat/config';
import {
  StarlayProtocolDataProvider__factory,
  ILendingPoolAddressesProvider__factory,
} from '../../types';

task(
  'deploy-reserve-implementations',
  'Deploy LToken and Variable debt tokens using prior reserve config'
)
  .addParam('provider')
  .addParam('assets')
  .addParam('incentivesController')
  .addParam('treasury')
  .addFlag('defender')
  .setAction(async ({ defender, provider, assets, incentivesController, treasury }, localBRE) => {
    await localBRE.run('set-DRE');
    const [deployer] = await localBRE.ethers.getSigners();
    const tokensToUpdate = assets.split(',');
    // Return variables
    const lTokens: string[] = [];
    const variableDebtTokens: string[] = [];

    // Instances
    const poolProvider = await ILendingPoolAddressesProvider__factory.connect(provider, deployer);
    const protocolDataProvider = await StarlayProtocolDataProvider__factory.connect(
      await poolProvider.getAddress(
        '0x0100000000000000000000000000000000000000000000000000000000000000'
      ),
      deployer
    );

    // Params
    const pool = await poolProvider.getLendingPool();

    const reserveConfigs = (await protocolDataProvider.getAllReservesTokens())
      .filter(({ symbol }) => tokensToUpdate.includes(symbol))
      .sort(({ symbol: a }, { symbol: b }) => a.localeCompare(b));

    if (reserveConfigs.length != tokensToUpdate.length) {
      throw Error(
        "Reserves and assets missmatch. Check 'assets' task params to include all reserves"
      );
    }

    for (let x = 0; x < reserveConfigs.length; x++) {
      lTokens[x] = await localBRE.run('deploy-ltoken', {
        pool,
        asset: reserveConfigs[x].tokenAddress,
        treasury,
        incentivesController,
        defender,
      });
      console.log(`- Deployed ${reserveConfigs[x].symbol} LToken impl at: ${lTokens[x]}`);
      variableDebtTokens[x] = await localBRE.run('deploy-var-debt-token', {
        pool,
        asset: reserveConfigs[x].tokenAddress,
        incentivesController,
        defender,
      });
      console.log(
        `- Deployed ${reserveConfigs[x].symbol} Variable Debt Token impl at: ${variableDebtTokens[x]}`
      );
    }

    return {
      aTokens: lTokens,
      variableDebtTokens,
    };
  });
