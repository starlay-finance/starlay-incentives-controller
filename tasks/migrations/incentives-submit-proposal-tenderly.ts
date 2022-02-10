import { formatEther, parseEther } from 'ethers/lib/utils';
import { task } from 'hardhat/config';
import { advanceBlockTo, DRE, increaseTime, latestBlock } from '../../helpers/misc-utils';
import { IERC20__factory, IGovernancePowerDelegationToken__factory } from '../../types';
import { IStarlayGovernanceV2 } from '../../types/IStarlayGovernanceV2';
import { getDefenderRelaySigner } from '../../helpers/defender-utils';
import isIPFS from 'is-ipfs';
import { Signer } from '@ethersproject/abstract-signer';
import { logError } from '../../helpers/tenderly-utils';

const {
  STARLAY_TOKEN = '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
  GOVERNANCE_V2 = '0xEC568fffba86c094cf06b22134B23074DFE2252c', // mainnet
  STARLAY_SHORT_EXECUTOR = '0xee56e2b3d491590b5b31738cc34d5232f378a8d5', // mainnet
} = process.env;
const VOTING_DURATION = 19200;

const STARLAY_WHALE = '0x25f2226b597e8f9514b3f68f00f494cf4f286491';

task('incentives-submit-proposal:tenderly', 'Submit the incentives proposal to Starlay Governance')
  .addParam('proposalExecutionPayload')
  .addParam('aTokens')
  .addParam('variableDebtTokens')
  .addFlag('defender')
  .setAction(
    async ({ defender, proposalExecutionPayload, aTokens, variableDebtTokens }, localBRE) => {
      await localBRE.run('set-DRE');
      let proposer: Signer;
      [proposer] = await DRE.ethers.getSigners();

      const { signer } = await getDefenderRelaySigner();
      proposer = signer;

      const whale = DRE.ethers.provider.getSigner(STARLAY_WHALE);
      const layToken = IERC20__factory.connect(STARLAY_TOKEN, whale);

      // Transfer enough Starlay to proposer
      await (await layToken.transfer(await proposer.getAddress(), parseEther('2000000'))).wait();

      if (!STARLAY_TOKEN || !GOVERNANCE_V2 || !STARLAY_SHORT_EXECUTOR) {
        throw new Error(
          'You have not set correctly the .env file, make sure to read the README.md'
        );
      }

      if (aTokens.split(',').length !== 6) {
        throw new Error('lTokens input param should have 6 elements');
      }

      if (variableDebtTokens.split(',').length !== 6) {
        throw new Error('variable debt token param should have 6 elements');
      }

      const proposerAddress = await proposer.getAddress();

      // Initialize contracts and tokens
      const gov = (await DRE.ethers.getContractAt(
        'IStarlayGovernanceV2',
        GOVERNANCE_V2,
        proposer
      )) as IStarlayGovernanceV2;

      // Balance and proposal power check
      const balance = await layToken.balanceOf(proposerAddress);
      const priorBlock = ((await latestBlock()) - 1).toString();
      const govToken = IGovernancePowerDelegationToken__factory.connect(STARLAY_TOKEN, proposer);
      const propositionPower = await govToken.getPowerAtBlock(proposerAddress, priorBlock, '1');

      console.log('- Starlay Balance proposer', formatEther(balance));
      console.log(
        `- Proposition power of ${proposerAddress} at block: ${priorBlock}`,
        formatEther(propositionPower)
      );

      // Submit proposal
      const proposalId = await gov.getProposalsCount();
      const proposalParams = {
        proposalExecutionPayload,
        aTokens,
        variableDebtTokens,
        governance: GOVERNANCE_V2,
        shortExecutor: STARLAY_SHORT_EXECUTOR,
        defender: true,
      };
      console.log('- Submitting proposal with following params:');
      console.log(JSON.stringify(proposalParams, null, 2));

      await DRE.run('propose-incentives', proposalParams);
      console.log('- Proposal Submited:', proposalId.toString());

      // Mine block due flash loan voting protection
      await advanceBlockTo((await latestBlock()) + 1);

      // Submit vote and advance block to Queue phase
      try {
        console.log('Submitting vote...');
        await (await gov.submitVote(proposalId, true)).wait();
        console.log('Voted');
      } catch (error) {
        logError();
        throw error;
      }

      await advanceBlockTo((await latestBlock()) + VOTING_DURATION + 1);

      try {
        // Queue and advance block to Execution phase
        console.log('Queueing');
        await (await gov.queue(proposalId, { gasLimit: 3000000 })).wait();
        console.log('Queued');
      } catch (error) {
        logError();
        throw error;
      }
      await increaseTime(86400 + 10);

      // Execute payload

      try {
        console.log('Executing');
        await (await gov.execute(proposalId, { gasLimit: 6000000 })).wait();
      } catch (error) {
        logError();
        throw error;
      }
      console.log('Proposal executed');
    }
  );
