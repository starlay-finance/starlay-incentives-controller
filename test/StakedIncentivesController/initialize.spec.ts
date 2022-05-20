import { makeSuite, TestEnv } from '../helpers/make-suite';
import { MAX_UINT_AMOUNT, ZERO_ADDRESS } from '../../helpers/constants';
import { StakedTokenIncentivesController__factory } from '../../types';
import { getFirstSigner } from '../../helpers/contracts-helpers';

const { expect } = require('chai');

makeSuite('IncentivesController initialize', (testEnv: TestEnv) => {
  it('Tries to call initialize second time, should be reverted', async () => {
    const { incentivesController } = testEnv;
    await expect(incentivesController.initialize(ZERO_ADDRESS)).to.be.reverted;
  });
  it('allowance on lay token should be granted to psm contract for pei', async () => {
    const { incentivesController, stakedToken, token } = testEnv;
    await expect(
      (await token.allowance(incentivesController.address, stakedToken.address)).toString()
    ).to.be.equal(MAX_UINT_AMOUNT);
  });
  it('should be reverted if emissionManager is zero address', async () => {
    const { stakedToken } = testEnv;
    const target = await new StakedTokenIncentivesController__factory(
      await getFirstSigner()
    ).deploy(stakedToken.address);
    await expect(target.initialize(ZERO_ADDRESS)).to.be.revertedWith('INVALID_EMISSION_MANAGER');
  });
  it('should be reverted if rewardToken is zero address', async () => {
    await expect(
      new StakedTokenIncentivesController__factory(await getFirstSigner()).deploy(ZERO_ADDRESS)
    ).to.be.revertedWith('INVALID_REWARD_ADDRESS');
  });
});
