import { Signer } from 'ethers';
import { ZERO_ADDRESS } from '../../helpers/constants';
import {
  deployStakedTokenIncentivesController,
  deployInitializableAdminUpgradeabilityProxy,
  deployMintableErc20,
} from '../../helpers/contracts-accessors';
import { getFirstSigner, insertContractAddressInDb } from '../../helpers/contracts-helpers';
import { verifyContract } from '../../helpers/etherscan-verification';
import { eContractid, tEthereumAddress } from '../../helpers/types';
import { MintableErc20, StakedLayV2__factory } from '../../types';

export const COOLDOWN_SECONDS = '3600'; // 1 hour in seconds
export const UNSTAKE_WINDOW = '1800'; // 30 min in second

export const testDeployIncentivesController = async (
  emissionManager: Signer,
  vaultOfRewards: Signer,
  proxyAdmin: Signer,
  token: MintableErc20
) => {
  const emissionManagerAddress = await emissionManager.getAddress();
  // Deploy proxies and implementations
  const stakeProxy = await deployInitializableAdminUpgradeabilityProxy();
  const incentivesProxy = await deployInitializableAdminUpgradeabilityProxy();

  const stakeV3 = await deployStakedLayV2([
    token.address,
    token.address,
    COOLDOWN_SECONDS,
    UNSTAKE_WINDOW,
    await vaultOfRewards.getAddress(),
    emissionManagerAddress,
    (1000 * 60 * 60).toString(),
  ]);

  const incentivesImplementation = await deployStakedTokenIncentivesController([
    stakeProxy.address,
    emissionManagerAddress,
  ]);

  // Initialize proxies
  const stakeInit = stakeV3.interface.encodeFunctionData(
    // @ts-ignore
    'initialize()',
    []
  );
  const incentivesInit = incentivesImplementation.interface.encodeFunctionData('initialize');

  await (
    await stakeProxy['initialize(address,address,bytes)'](
      stakeV3.address,
      await proxyAdmin.getAddress(),
      stakeInit
    )
  ).wait();
  await (
    await incentivesProxy['initialize(address,address,bytes)'](
      incentivesImplementation.address,
      await proxyAdmin.getAddress(),
      incentivesInit
    )
  ).wait();

  await insertContractAddressInDb(eContractid.AaveIncentivesController, incentivesProxy.address);

  return { incentivesProxy, stakeProxy };
};

const deployStakedLayV2 = async (
  [
    stakedToken,
    rewardsToken,
    cooldownSeconds,
    unstakeWindow,
    rewardsVault,
    emissionManager,
    distributionDuration,
  ]: [
    tEthereumAddress,
    tEthereumAddress,
    string,
    string,
    tEthereumAddress,
    tEthereumAddress,
    string
  ],
  verify?: boolean
) => {
  const id = eContractid.StakedLayV2;
  const args: string[] = [
    stakedToken,
    rewardsToken,
    cooldownSeconds,
    unstakeWindow,
    rewardsVault,
    emissionManager,
    distributionDuration,
    ZERO_ADDRESS, // gov address
  ];
  const instance = await new StakedLayV2__factory(await getFirstSigner()).deploy(
    stakedToken,
    rewardsToken,
    cooldownSeconds,
    unstakeWindow,
    rewardsVault,
    emissionManager,
    distributionDuration,
    ZERO_ADDRESS // gov address);
  );
  if (verify) {
    await verifyContract(instance.address, args);
  }
  return instance;
};
