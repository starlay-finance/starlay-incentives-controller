import { task } from 'hardhat/config';
import { config } from 'dotenv';
import { Signer } from 'ethers';
import { getDefenderRelaySigner } from '../../helpers/defender-utils';
import { getIncentivesConfigPerNetwork, getTokenAddressPerNetwork } from '../../helpers/constants';
import { eNetwork } from '../../helpers/types';
import { deployIncentivesExecutor } from '../../helpers/contracts-accessors';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const bs58 = require('bs58');
config();
task('deploy-incentives-executor', 'Deploy incentives executor')
  .addFlag('defender')
  .setAction(async ({ defender }, localBRE) => {
    await localBRE.run('set-DRE');
    const network = <eNetwork>localBRE.network.name;

    let proposer: Signer;
    [proposer] = await localBRE.ethers.getSigners();

    if (defender) {
      const { signer } = await getDefenderRelaySigner();
      proposer = signer;
    }
    const {
      addressProvider,
      poolConfigurator,
      rewardsVault,
      lendingPool,
      incentiveControllerProxy,
      incentiveControllerImpl,
    } = getIncentivesConfigPerNetwork(network);
    const tokens = getTokenAddressPerNetwork(network);
    const layToken = tokens.LAY;
    const executor = await deployIncentivesExecutor([
      layToken,
      poolConfigurator,
      addressProvider,
      lendingPool,
      rewardsVault,
      incentiveControllerProxy,
      incentiveControllerImpl,
    ]);

    console.log(`Incentives executor deployed at ${executor.address}`);
    return executor.address;
  });
