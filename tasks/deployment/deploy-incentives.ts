import { task } from 'hardhat/config';
import { config } from 'dotenv';
import { IStarlayGovernanceV2__factory } from '../../types';
import { Signer } from 'ethers';
import { getDefenderRelaySigner } from '../../helpers/defender-utils';
import { DRE } from '../../helpers/misc-utils';
import { logError } from '../../helpers/tenderly-utils';
import {
  getlTokenAddressPerNetwork,
  getTokenAddressPerNetwork,
  getVdTokenAddressPerNetwork,
} from '../../helpers/constants';
import { eNetwork } from '../../helpers/types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const bs58 = require('bs58');

config();

task('deploy-incentives', 'Deploy incentives')
  .addFlag('defender')
  .setAction(async ({ defender }, localBRE: any) => {
    await localBRE.run('set-DRE');
    const network = <eNetwork>localBRE.network.name;

    let proposer: Signer;
    [proposer] = await localBRE.ethers.getSigners();

    if (defender) {
      const { signer } = await getDefenderRelaySigner();
      proposer = signer;
    }
    const ltokens = getlTokenAddressPerNetwork(network);
    const vdTokens = getVdTokenAddressPerNetwork(network);
    const tokens = getTokenAddressPerNetwork(network);
    const callData = DRE.ethers.utils.defaultAbiCoder.encode(
      ['address[8]', 'address[8]', 'address[8]'],
      [ltokens, vdTokens]
    );

    const executeSignature = 'execute(address[8],address[8])';
    const gov = await IStarlayGovernanceV2__factory.connect(governance, proposer);
    const ipfsEncoded = '0xf7a1f565fcd7684fba6fea5d77c5e699653e21cb6ae25fbf8c5dbc8d694c7949';

    try {
      const tx = await gov.create(
        shortExecutor,
        [proposalExecutionPayload],
        ['0'],
        [executeSignature],
        [callData],
        [true],
        ipfsEncoded,
        { gasLimit: 3000000 }
      );
      console.log('- Proposal submitted to Governance');
      await tx.wait();
    } catch (error) {
      logError();
      throw error;
    }

    console.log('Your Proposal has been submitted');
  });
