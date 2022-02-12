import { task } from 'hardhat/config';
import { DefenderRelaySigner, DefenderRelayProvider } from 'defender-relay-client/lib/ethers';
import { deployInitializableAdminUpgradeabilityProxy, deployStakedTokenIncentivesController } from '../../helpers/contracts-accessors';
import { getDefenderRelaySigner } from '../../helpers/defender-utils';
import { waitForTx } from '../../helpers/misc-utils';
import { eContractid } from '../../helpers/types';

// Shibuya (astar network) addresses
const STAKED_STARLAY = '0x3bA5A4b88331627236378000B50eAa186375c3FF'; // StakedLay's (StakedTokenV2Rev3) proxy
const STARLAY_SHORT_EXECUTOR = '0x6543076E4315bd82129105890Bc49c18f496a528'; // PoolAdmin

task('deploy-incentives-impl', 'Incentives controller implementation deployment').setAction(
  async (_, localBRE) => {
    _;
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

    console.log(`[StakedTokenIncentivesController] Starting deployment:`);
    const impl = await deployStakedTokenIncentivesController(
      [STAKED_STARLAY],
      false // TODO: select necessity to verify
    );
    console.log(`  - Deployed implementation of ${eContractid.StakedTokenIncentivesController}`);
    const proxy = await deployInitializableAdminUpgradeabilityProxy(false);  // TODO: select necessity to verify
    console.log(`  - Deployed proxy of ${eContractid.StakedTokenIncentivesController}`);
    const encodedParams = impl.interface.encodeFunctionData('initialize', [
      STARLAY_SHORT_EXECUTOR
    ]);

    await waitForTx(
      await proxy.functions['initialize(address,address,bytes)'](
        impl.address,
        await deployer.getAddress(),
        encodedParams
      )
    );
    console.log(`  - Initialized ${eContractid.StakedTokenIncentivesController} Proxy`);

    console.log(`  - Finished PullRewardsIncentivesController deployment and initialization`);
    console.log(`    - Proxy: ${proxy.address}`);
    console.log(`    - Impl: ${impl.address}`);

    return {
      proxy: proxy.address,
      implementation: impl.address
    };
  }
);
