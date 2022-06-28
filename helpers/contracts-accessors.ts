import {
  deployContract,
  getContractFactory,
  getContract,
  getFirstSigner,
  registerContractInJsonDb,
} from './contracts-helpers';
import { eContractid, tEthereumAddress } from './types';
import { MintableErc20 } from '../types/MintableErc20';
import { SelfdestructTransfer } from '../types/SelfdestructTransfer';
import { IERC20Detailed } from '../types/IERC20Detailed';
import { verifyContract } from './etherscan-verification';
import { LTokenMock } from '../types/LTokenMock';
import {
  PullRewardsIncentivesController__factory,
  InitializableAdminUpgradeabilityProxy__factory,
  StakedTokenIncentivesController,
  StakedTokenIncentivesController__factory,
  PullRewardsIncentivesControllerV2__factory,
  PullRewardsIncentivesControllerV3__factory,
} from '../types';
import { DefenderRelaySigner } from 'defender-relay-client/lib/ethers';
import { Signer } from 'ethers';

export const deployStakedTokenIncentivesController = async (
  [psm]: [tEthereumAddress],
  verify?: boolean,
  signer?: Signer | DefenderRelaySigner
) => {
  const args: [string] = [psm];
  const instance = await new StakedTokenIncentivesController__factory(
    signer || (await getFirstSigner())
  ).deploy(args[0]);
  await instance.deployTransaction.wait();
  if (verify) {
    await verifyContract(instance.address, args);
  }
  return instance;
};

export const deployPullRewardsIncentivesController = async (
  [rewardToken]: [tEthereumAddress],
  verify?: boolean,
  signer?: Signer | DefenderRelaySigner
) => {
  const args: [string] = [rewardToken];
  const instance = await new PullRewardsIncentivesController__factory(
    signer || (await getFirstSigner())
  ).deploy(args[0]);
  await instance.deployTransaction.wait();
  if (verify) {
    await verifyContract(instance.address, args);
  }
  return instance;
};

export const deployPullRewardsIncentivesControllerV2 = async (
  [rewardToken]: [tEthereumAddress],
  verify?: boolean,
  signer?: Signer | DefenderRelaySigner
) => {
  const args: [string] = [rewardToken];
  const instance = await new PullRewardsIncentivesControllerV2__factory(
    signer || (await getFirstSigner())
  ).deploy(args[0]);
  await instance.deployTransaction.wait();
  if (verify) {
    await verifyContract(instance.address, args);
  }
  return instance;
};

export const deployPullRewardsIncentivesControllerV3 = async (
  [rewardToken]: [tEthereumAddress],
  verify?: boolean,
  signer?: Signer | DefenderRelaySigner
) => {
  const args: [string] = [rewardToken];
  const instance = await new PullRewardsIncentivesControllerV3__factory(
    signer || (await getFirstSigner())
  ).deploy(args[0]);
  await instance.deployTransaction.wait();
  if (verify) {
    await verifyContract(instance.address, args);
  }
  return instance;
};

export const deployInitializableAdminUpgradeabilityProxy = async (verify?: boolean) => {
  const args: string[] = [];
  const instance = await new InitializableAdminUpgradeabilityProxy__factory(
    await getFirstSigner()
  ).deploy();
  await instance.deployTransaction.wait();
  if (verify) {
    await verifyContract(instance.address, args);
  }
  return instance;
};

export const deployMintableErc20 = async ([name, symbol]: [string, string]) =>
  await deployContract<MintableErc20>(eContractid.MintableErc20, [name, symbol]);

export const deployLTokenMock = async (aicAddress: tEthereumAddress, slug: string) => {
  const instance = await deployContract<LTokenMock>(eContractid.LTokenMock, [aicAddress]);
  await registerContractInJsonDb(`${eContractid.LTokenMock}-${slug}`, instance);
};

export const getMintableErc20 = getContractFactory<MintableErc20>(eContractid.MintableErc20);

export const getStakedTokenIncentivesController =
  getContractFactory<StakedTokenIncentivesController>(eContractid.StakedTokenIncentivesController);

export const getIncentivesController = async (address: tEthereumAddress) =>
  StakedTokenIncentivesController__factory.connect(address, await getFirstSigner());

export const getPullRewardsIncentivesController = async (address: tEthereumAddress) =>
  PullRewardsIncentivesController__factory.connect(address, await getFirstSigner());

export const getIErc20Detailed = getContractFactory<IERC20Detailed>(eContractid.IERC20Detailed);

export const getLTokenMock = getContractFactory<LTokenMock>(eContractid.LTokenMock);

export const getERC20Contract = (address: tEthereumAddress) =>
  getContract<MintableErc20>(eContractid.MintableErc20, address);

export const deploySelfDestruct = async () => {
  const id = eContractid.MockSelfDestruct;
  const instance = await deployContract<SelfdestructTransfer>(id, []);
  await instance.deployTransaction.wait();
  return instance;
};
