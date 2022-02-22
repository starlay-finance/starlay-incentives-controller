import { makeSuite, TestEnv } from '../helpers/make-suite';
import { MAX_UINT_AMOUNT, ZERO_ADDRESS } from '../../helpers/constants';

const { expect } = require('chai');

makeSuite('IncentivesController initialize', (testEnv: TestEnv) => {
  // TODO: useless or not?
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
});
