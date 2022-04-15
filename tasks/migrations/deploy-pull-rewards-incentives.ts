import { isAddress } from 'ethers/lib/utils';
import { task } from 'hardhat/config';
import {
  getEmissionManagerPerNetwork,
  getProxyAdminPerNetwork,
  getRewardVaultPerNetwork,
  getStakedTokenPerNetwork,
  ZERO_ADDRESS,
} from '../../helpers/constants';
import {
  deployPullRewardsIncentivesController,
  deployInitializableAdminUpgradeabilityProxy,
} from '../../helpers/contracts-accessors';
import { notFalsyOrZeroAddress, waitForTx } from '../../helpers/misc-utils';
import { eNetwork } from '../../helpers/types';

task(
  `deploy-pull-rewards-incentives`,
  `Deploy and initializes the PullRewardsIncentivesController contract`
)
  .addFlag('verify', 'Verify contracts deployed in this script at Etherscan.')
  .addOptionalParam('rewardToken', 'RewardToken address. ref: PullRewardsIncentivesController')
  .addOptionalParam('rewardsVault', 'RewardsVault address. ref: PullRewardsIncentivesController')
  .addOptionalParam(
    'emissionManager',
    'EmissionManager address. ref: PullRewardsIncentivesController'
  )
  .addOptionalParam(
    'proxyAdmin',
    `The address to be added as an Admin role at the Transparent Proxy.`
  )
  .setAction(
    async ({ verify, rewardToken, rewardsVault, emissionManager, proxyAdmin }, localBRE) => {
      await localBRE.run('set-DRE');

      const networkName = localBRE.network.name as eNetwork;
      if (!proxyAdmin) proxyAdmin = getProxyAdminPerNetwork(networkName);
      if (!notFalsyOrZeroAddress(proxyAdmin)) {
        throw Error('Missing or incorrect admin param');
      }
      if (!rewardToken) rewardToken = getStakedTokenPerNetwork(networkName);
      if (!notFalsyOrZeroAddress(rewardToken)) {
        throw Error('Missing or incorrect rewardToken param');
      }
      if (!rewardsVault) rewardsVault = getRewardVaultPerNetwork(networkName);
      if (!notFalsyOrZeroAddress(rewardsVault)) {
        throw Error('Missing or incorrect rewardsVault param');
      }
      if (!emissionManager) emissionManager = getEmissionManagerPerNetwork(networkName);
      if (!notFalsyOrZeroAddress(emissionManager)) {
        throw Error('Missing or incorrect emissionManager param');
      }

      console.log(`[PullRewardsIncentivesController] Starting deployment:`);
      console.log(`  - Network name: ${networkName}`);

      const incentivesControllerImpl = await deployPullRewardsIncentivesController(
        [rewardToken],
        verify
      );
      console.log(`  - Deployed implementation of PullRewardsIncentivesController`);

      const incentivesProxy = await deployInitializableAdminUpgradeabilityProxy(verify);
      console.log(`  - Deployed proxy of PullRewardsIncentivesController`);

      const encodedParams = incentivesControllerImpl.interface.encodeFunctionData('initialize', [
        rewardsVault,
        emissionManager,
      ]);

      await waitForTx(
        await incentivesProxy.functions['initialize(address,address,bytes)'](
          incentivesControllerImpl.address,
          proxyAdmin,
          encodedParams
        )
      );
      console.log(`  - Initialized  PullRewardsIncentivesController Proxy`);

      console.log(`  - Finished PullRewardsIncentivesController deployment and initialization`);
      console.log(`    - Proxy: ${incentivesProxy.address}`);
      console.log(`    - Impl: ${incentivesControllerImpl.address}`);

      return {
        proxy: incentivesProxy.address,
        implementation: incentivesControllerImpl.address,
      };
    }
  );
