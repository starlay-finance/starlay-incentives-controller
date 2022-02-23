import { task } from 'hardhat/config';
import { deployInitializableAdminUpgradeabilityProxy, deployStakedTokenIncentivesController } from '../../helpers/contracts-accessors';
import { getDefenderRelaySigner } from '../../helpers/defender-utils';
import { waitForTx } from '../../helpers/misc-utils';
import { eContractid, eNetwork } from '../../helpers/types';
import { getEmissionManagerPerNetwork, getProxyAdminPerNetwork, getStakedTokenPerNetwork } from '../../helpers/constants';
import { getFirstSigner } from '../../helpers/contracts-helpers';

task('deploy-incentives-impl', 'Deploy and Initialize the StakedTokenIncentivesController contract')
  .addFlag('verify', 'Verify contracts deployed in this script at Etherscan.')
  .addOptionalParam('proxyAdmin', 'Admin address for proxy contracts')
  .addOptionalParam('stakedToken', 'StakedToken address. ref: StakedTokenIncentivesController')
  .addOptionalParam('emissionManager', 'EmissionManager address. ref: StakedTokenIncentivesController')
  .setAction(
    async ({ verify, proxyAdmin, stakedToken, emissionManager }, localBRE) => {
      await localBRE.run('set-DRE');

      // setup deployer
      let deployer;
      if (process.env.DEFENDER_API_KEY && process.env.DEFENDER_SECRET_KEY) {
        const { signer } = await getDefenderRelaySigner();
        deployer = signer;
      } else {
        const [signer] = await localBRE.ethers.getSigners();
        deployer = signer;
      }

      const deployerAddress = await deployer.getAddress()
      console.log(`deployerAddress ... ${deployerAddress}`)

      const networkName = localBRE.network.name as eNetwork
      console.log(`[StakedTokenIncentivesController] Starting deployment:`);
      console.log(`  - Network name: ${networkName}`);

      const impl = await deployStakedTokenIncentivesController(
        [stakedToken || getStakedTokenPerNetwork(networkName)],
        verify
      );
      console.log(`  - Deployed implementation of ${eContractid.StakedTokenIncentivesController}: address - ${impl.address}`);

      const proxy = await deployInitializableAdminUpgradeabilityProxy(verify);
      console.log(`  - Deployed proxy of ${eContractid.StakedTokenIncentivesController}: address - ${proxy.address}`);
      const encodedParams = impl.interface.encodeFunctionData('initialize', [
        emissionManager || getEmissionManagerPerNetwork(networkName)
      ]);

      await waitForTx(
        await proxy.functions['initialize(address,address,bytes)'](
          impl.address,
          deployerAddress, // await (await getFirstSigner()).address, // proxyAdmin || getProxyAdminPerNetwork(networkName),
          encodedParams
        )
      );
      console.log(`  - Initialized ${eContractid.StakedTokenIncentivesController} Proxy`);

      console.log(`  - Finished ${eContractid.StakedTokenIncentivesController} deployment and initialization`);
      console.log(`    - Proxy: ${proxy.address}`);
      console.log(`    - Impl: ${impl.address}`);

      return {
        proxy: proxy.address,
        implementation: impl.address
      };
    }
  );
