import { InitializableAdminUpgradeabilityProxy__factory } from '../../types/factories/InitializableAdminUpgradeabilityProxy__factory';
import { eAstarNetwork, tEthereumAddress } from '../../helpers/types';
import { isAddress } from 'ethers/lib/utils';
import { ContractTransaction, Signer, Wallet } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';
import { PullRewardsIncentivesControllerV4__factory } from '../../types';

require('dotenv').config();

const waitForTx = async (tx: ContractTransaction) => await tx.wait(1);
const deployPullRewardsIncentivesControllerV4 = async (
  rewardToken: tEthereumAddress,
  signer?: Signer
) => {
  const instance = await new PullRewardsIncentivesControllerV4__factory(signer).deploy(rewardToken);
  await instance.deployTransaction.wait();
  return instance;
};

const upgradeIncentivesControllerToV4 = async () => {
  const networkName = eAstarNetwork.astar;

  const EMISSION_MANAGER_PRIVATE_KEY = process.env.EMISSION_MANAGER_PRIVATE_KEY || '';
  const INCENTIVES_CONTROLLER_ADMIN_PRIVATE_KEY =
    process.env.INCENTIVES_CONTROLLER_ADMIN_PRIVATE_KEY || '';
  if (!EMISSION_MANAGER_PRIVATE_KEY) {
    throw new Error('emission manager private key is empty');
  }
  if (!INCENTIVES_CONTROLLER_ADMIN_PRIVATE_KEY) {
    throw new Error('vault private key is empty');
  }
  const rewardToken = '0xc4335B1b76fA6d52877b3046ECA68F6E708a27dd';
  if (!isAddress(rewardToken)) {
    throw Error('Missing or incorrect rewardToken param');
  }
  const provider = new JsonRpcProvider('https://evm.astar.network');

  const emissionManager = new Wallet(EMISSION_MANAGER_PRIVATE_KEY, provider);
  const admin = new Wallet(INCENTIVES_CONTROLLER_ADMIN_PRIVATE_KEY, provider);

  const { rewardsVault, lendingPool, voter, incentiveControllerProxy } = {
    // addressProvider: '0x4c37A76Bf49c01f91E275d5257a228dad1b74EF9',
    rewardsVault: '0x43822E69852Ca59211bBC1Bd429feAb6A62A9f44',
    // incentiveControllerImpl: '0x83e98264Cd6f39D41501e5ef86a8b924BCC82D1e',
    incentiveControllerProxy: '0x97Ab79B80E8904214413D8219E8B04373D1030AD',
    lendingPool: '0x90384334333f3356eFDD5b20016350843b90f182',
    // poolConfigurator: '0xa1c2ED9e0d09f5e441aC9C44AFa308D38dAf463c',
    // starlayToken: '0xc4335B1b76fA6d52877b3046ECA68F6E708a27dd',
    voter: '0xB45Ae34e16D97D87c021DAf03a15142935cFB177',
  };
  console.log(`[PullRewardsIncentivesControllerV4] Starting deployment:`);
  console.log(`  - Network name: ${networkName}`);
  const incentivesControllerV4Impl = await deployPullRewardsIncentivesControllerV4(
    rewardToken,
    admin
  );
  console.log(
    `  - Deployed implementation of PullRewardsIncentivesControllerV4 at:`,
    incentivesControllerV4Impl.address
  );

  const encodeParams = incentivesControllerV4Impl.interface.encodeFunctionData('initialize', [
    rewardsVault,
    lendingPool,
    voter,
    emissionManager.address,
  ]);
  const incentivesControllerProxy = InitializableAdminUpgradeabilityProxy__factory.connect(
    incentiveControllerProxy,
    admin
  );

  await waitForTx(
    await incentivesControllerProxy.upgradeToAndCall(
      incentivesControllerV4Impl.address,
      encodeParams
    )
  );
};

upgradeIncentivesControllerToV4();
