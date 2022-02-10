import { Signer } from 'ethers';
import { task } from 'hardhat/config';
import { ZERO_ADDRESS } from '../../helpers/constants';
import { getDefenderRelaySigner } from '../../helpers/defender-utils';
import { ILendingPoolData__factory, IERC20Detailed__factory, LToken__factory } from '../../types';

task('deploy-ltoken', 'Deploy LToken using prior reserve config')
  .addParam('pool')
  .addParam('asset')
  .addParam('treasury')
  .addParam('incentivesController')
  .addOptionalParam('tokenName')
  .addOptionalParam('tokenSymbol')
  .addFlag('defender')
  .setAction(
    async (
      { defender, pool, asset, treasury, incentivesController, tokenName, tokenSymbol },
      localBRE
    ) => {
      await localBRE.run('set-DRE');

      let deployer: Signer;
      [deployer] = await localBRE.ethers.getSigners();

      if (defender) {
        const { signer } = await getDefenderRelaySigner();
        deployer = signer;
      }

      const { lTokenAddress } = await ILendingPoolData__factory.connect(
        pool,
        deployer
      ).getReserveData(asset);

      if (!tokenSymbol && lTokenAddress === ZERO_ADDRESS) {
        throw new Error(
          "Reserve does not exists or not initialized. Pass 'tokenSymbol' as param to the task.'"
        );
      }
      if (!tokenName && lTokenAddress === ZERO_ADDRESS) {
        throw new Error(
          "Reserve does not exists or not initialized. Pass 'tokenName' as param to the task.'"
        );
      }

      // Grab same name and symbol from old implementation
      if (!tokenName) {
        tokenName = await IERC20Detailed__factory.connect(lTokenAddress, deployer).name();
      }
      if (!tokenSymbol) {
        tokenSymbol = await IERC20Detailed__factory.connect(lTokenAddress, deployer).symbol();
      }

      // const { address } = await new LToken__factory(deployer).deploy(
      //   pool,
      //   asset,
      //   treasury,
      //   tokenName,
      //   tokenSymbol,
      //   incentivesController
      // );
      // TODO: follow starlay-protocol's LToken / maybe use proxy update
      const { address } = await new LToken__factory(deployer).deploy()

      return address;
    }
  );
