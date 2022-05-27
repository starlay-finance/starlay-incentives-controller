import { expect } from 'chai';
import { parseEther } from 'ethers/lib/utils';

import { makeSuite, TestEnv } from '../helpers/make-suite';
import { getEthersSigners } from '../../helpers/contracts-helpers';
import {
  InitializableAdminUpgradeabilityProxy__factory,
  PullRewardsIncentivesControllerV2__factory,
} from '../../types';
import { BigNumber } from 'ethers';

makeSuite('PullRewardsIncentivesController - migrate', (testEnv: TestEnv) => {
  it('Upgradability', async () => {
    const { pullRewardsIncentivesController, lDaiBaseMock, token, rewardsVault } = testEnv;
    const emissionPerSecond = parseEther('1');

    // configured on v1
    await pullRewardsIncentivesController.configureAssets(
      [lDaiBaseMock.address],
      [emissionPerSecond]
    );
    const [user, admin] = await getEthersSigners();

    const v2Impl = await new PullRewardsIncentivesControllerV2__factory(admin).deploy(
      token.address
    );
    expect(await v2Impl.REVISION()).to.be.eq(2);
    const v2encodedInit = v2Impl.interface.encodeFunctionData('initialize', [
      rewardsVault.address,
      await admin.getAddress(),
    ]);
    const proxy = InitializableAdminUpgradeabilityProxy__factory.connect(
      pullRewardsIncentivesController.address,
      admin
    );
    // upgrade
    await proxy.upgradeToAndCall(v2Impl.address, v2encodedInit);
    const v2Instance = PullRewardsIncentivesControllerV2__factory.connect(
      pullRewardsIncentivesController.address,
      user
    );
    expect(await v2Instance.REVISION()).to.be.eq(BigNumber.from(2));
    const lDAIEmissionPerSecond = (await v2Instance.getAssetData(lDaiBaseMock.address))[1];
    expect(lDAIEmissionPerSecond).to.be.eq(emissionPerSecond);
  });
  it('migrartion: lay on IncentivesController should be transferred to new vault', async () => {
    const { pullRewardsIncentivesController, token, rewardsVault } = testEnv;
    const [newAdmin, emissionManager, user2] = await getEthersSigners();
    const layAmountOnIncentivesController = parseEther('100');
    await token
      .connect(user2)
      .transfer(pullRewardsIncentivesController.address, layAmountOnIncentivesController);
    const proxyInstance = InitializableAdminUpgradeabilityProxy__factory.connect(
      pullRewardsIncentivesController.address,
      emissionManager
    );
    proxyInstance.changeAdmin(await newAdmin.getAddress());

    const v2Instance = PullRewardsIncentivesControllerV2__factory.connect(
      pullRewardsIncentivesController.address,
      newAdmin
    );
    const vaultAmountBefore = await token.balanceOf(rewardsVault.address);
    await v2Instance.connect(emissionManager).migrate();
    const vaultAmountAfter = await token.balanceOf(rewardsVault.address);
    expect(await token.balanceOf(pullRewardsIncentivesController.address)).to.be.eq(0);
    expect(vaultAmountAfter).to.be.eq(vaultAmountBefore.add(layAmountOnIncentivesController));
  });
});
