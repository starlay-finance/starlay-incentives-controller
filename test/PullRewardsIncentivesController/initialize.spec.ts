import { makeSuite, TestEnv } from '../helpers/make-suite';
import { MAX_UINT_AMOUNT, ZERO_ADDRESS } from '../../helpers/constants';
import { PullRewardsIncentivesController__factory } from '../../types';
import { getFirstSigner } from '../../helpers/contracts-helpers';

const { expect } = require('chai');

makeSuite('pullRewardsIncentivesController initialize', (testEnv: TestEnv) => {
  it('Tries to call initialize second time, should be reverted', async () => {
    const { pullRewardsIncentivesController } = testEnv;
    await expect(pullRewardsIncentivesController.initialize(ZERO_ADDRESS, ZERO_ADDRESS)).to.be
      .reverted;
  });
  it('should be reverted if emissionManager is zero address', async () => {
    const { stakedToken, token } = testEnv;
    const target = await new PullRewardsIncentivesController__factory(
      await getFirstSigner()
    ).deploy(stakedToken.address);
    const anyAddress = token.address;
    await expect(target.initialize(anyAddress, ZERO_ADDRESS)).to.be.revertedWith(
      'INVALID_EMISSION_MANAGER'
    );
  });
  it('should be reverted if rewardToken is zero address', async () => {
    await expect(
      new PullRewardsIncentivesController__factory(await getFirstSigner()).deploy(ZERO_ADDRESS)
    ).to.be.revertedWith('INVALID_REWARD_ADDRESS');
  });
});
