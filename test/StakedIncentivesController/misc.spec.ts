import { timeLatest, waitForTx } from '../../helpers/misc-utils';

import { expect } from 'chai';

import { makeSuite } from '../helpers/make-suite';
import { deployStakedTokenIncentivesController } from '../../helpers/contracts-accessors';
import { MAX_UINT_AMOUNT, RANDOM_ADDRESSES, ZERO_ADDRESS } from '../../helpers/constants';

makeSuite('IncentivesController misc tests', (testEnv) => {
  it('constructor should assign correct params', async () => {
    const peiEmissionManager = RANDOM_ADDRESSES[1];
    const psm = RANDOM_ADDRESSES[5];

    const incentivesController = await deployStakedTokenIncentivesController([
      psm,
      peiEmissionManager,
    ]);
    await expect(await incentivesController.STAKE_TOKEN()).to.be.equal(psm);
    await expect((await incentivesController.EMISSION_MANAGER()).toString()).to.be.equal(
      peiEmissionManager
    );
  });

  it('Should return same index while multiple asset index updates', async () => {
    const { aDaiMock, incentivesController, users } = testEnv;
    await waitForTx(await incentivesController.configureAssets([aDaiMock.address], ['100']));
    await waitForTx(await aDaiMock.doubleHandleActionOnAic(users[1].address, '2000', '100'));
  });

  it('Should overflow index if passed a large emission', async () => {
    const { aDaiMock, incentivesController, users } = testEnv;
    const MAX_104_UINT = '20282409603651670423947251286015';

    await waitForTx(
      await incentivesController.configureAssets([aDaiMock.address], [MAX_104_UINT])
    );
    await expect(
      aDaiMock.doubleHandleActionOnAic(users[1].address, '2000', '100')
    ).to.be.revertedWith('Index overflow');
  });

  it('Should configureAssets revert if parameters length does not match', async () => {
    const { aDaiMock, incentivesController } = testEnv;

    await expect(
      incentivesController.configureAssets([aDaiMock.address], ['1', '2'])
    ).to.be.revertedWith('INVALID_CONFIGURATION');
  });

  it('Should configureAssets revert if emission parameter overflows uin104', async () => {
    const { aDaiMock, incentivesController } = testEnv;

    await expect(
      incentivesController.configureAssets([aDaiMock.address], [MAX_UINT_AMOUNT])
    ).to.be.revertedWith('Index overflow at emissionsPerSecond');
  });

  it('Should REWARD_TOKEN getter returns the stake token address to keep old interface compatibility', async () => {
    const { incentivesController, stakedToken } = testEnv;
    await expect(await incentivesController.REWARD_TOKEN()).to.be.equal(stakedToken.address);
  });

  it('Should claimRewards revert if to argument is ZERO_ADDRESS', async () => {
    const { incentivesController, users, aDaiMock } = testEnv;
    const [userWithRewards] = users;

    await waitForTx(await incentivesController.configureAssets([aDaiMock.address], ['2000']));
    await waitForTx(await aDaiMock.setUserBalanceAndSupply('300000', '30000'));

    // Claim from third party claimer
    await expect(
      incentivesController
        .connect(userWithRewards.signer)
        .claimRewards([aDaiMock.address], MAX_UINT_AMOUNT, ZERO_ADDRESS)
    ).to.be.revertedWith('INVALID_TO_ADDRESS');
  });
});
