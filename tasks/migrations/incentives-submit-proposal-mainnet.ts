import { formatEther } from 'ethers/lib/utils';
import { task } from 'hardhat/config';
import { DRE, impersonateAccountsHardhat, latestBlock } from '../../helpers/misc-utils';
import { IERC20__factory, IGovernancePowerDelegationToken__factory } from '../../types';
import { IStarlayGovernanceV2 } from '../../types/IStarlayGovernanceV2';
import { getDefenderRelaySigner } from '../../helpers/defender-utils';
import isIPFS from 'is-ipfs';
import { Signer } from '@ethersproject/abstract-signer';

const {
  STARLAY_TOKEN = '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
  GOVERNANCE_V2 = '0xEC568fffba86c094cf06b22134B23074DFE2252c', // mainnet
  STARLAY_SHORT_EXECUTOR = '0xee56e2b3d491590b5b31738cc34d5232f378a8d5', // mainnet
} = process.env;

task('incentives-submit-proposal:mainnet', 'Submit the incentives proposal to Starlay Governance')
  .addParam('proposalExecutionPayload')
  .addParam('aTokens')
  .addParam('variableDebtTokens')
  .addFlag('defender')
  .setAction(
    async ({ defender, proposalExecutionPayload, aTokens, variableDebtTokens }, localBRE) => {
      await localBRE.run('set-DRE');
      let proposer: Signer;
      [proposer] = await DRE.ethers.getSigners();

      if (defender) {
        const { signer } = await getDefenderRelaySigner();
        proposer = signer;
      }

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

      const layToken = IERC20__factory.connect(STARLAY_TOKEN, proposer);

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
        lTokens: aTokens,
        variableDebtTokens,
        governance: GOVERNANCE_V2,
        shortExecutor: STARLAY_SHORT_EXECUTOR,
        defender: true,
      };
      console.log('- Submitting proposal with following params:');
      console.log(JSON.stringify(proposalParams, null, 2));

      await DRE.run('propose-incentives', proposalParams);
      console.log('- Proposal Submited:', proposalId.toString());
    }
  );
