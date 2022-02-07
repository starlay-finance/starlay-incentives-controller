import { evmRevert, evmSnapshot, DRE } from '../../helpers/misc-utils';
import { Signer } from 'ethers';
import { getEthersSigners } from '../../helpers/contracts-helpers';
import { tEthereumAddress } from '../../helpers/types';

import chai from 'chai';
// @ts-ignore
import bignumberChai from 'chai-bignumber';
import { getATokenMock } from '../../helpers/contracts-accessors';
import { MintableErc20 } from '../../types/MintableErc20';
import { ATokenMock } from '../../types/ATokenMock';
import {
  PullRewardsIncentivesController,
  PullRewardsIncentivesController__factory,
  StakedAaveV3,
  StakedTokenIncentivesController,
} from '../../types';

chai.use(bignumberChai());

export let stakedTokenInitializeTimestamp = 0;
export const setStakedTokenInitializeTimestamp = (timestamp: number) => {
  stakedTokenInitializeTimestamp = timestamp;
};

export interface SignerWithAddress {
  signer: Signer;
  address: tEthereumAddress;
}
export interface TestEnv {
  rewardsVault: SignerWithAddress;
  deployer: SignerWithAddress;
  users: SignerWithAddress[];
  token: MintableErc20;
  aaveIncentivesController: StakedTokenIncentivesController;
  pullRewardsIncentivesController: PullRewardsIncentivesController;
  stakedToken: StakedAaveV3;
  aDaiMock: ATokenMock;
  aWethMock: ATokenMock;
  aDaiBaseMock: ATokenMock;
  aWethBaseMock: ATokenMock;
}

let buidlerevmSnapshotId: string = '0x1';
const setBuidlerevmSnapshotId = (id: string) => {
  if (DRE.network.name === 'hardhat') {
    buidlerevmSnapshotId = id;
  }
};

const testEnv: TestEnv = {
  deployer: {} as SignerWithAddress,
  users: [] as SignerWithAddress[],
  token: {} as MintableErc20,
  stakedToken: {} as StakedAaveV3,
  aaveIncentivesController: {} as StakedTokenIncentivesController,
  pullRewardsIncentivesController: {} as PullRewardsIncentivesController,
  aDaiMock: {} as ATokenMock,
  aWethMock: {} as ATokenMock,
  aDaiBaseMock: {} as ATokenMock,
  aWethBaseMock: {} as ATokenMock,
} as TestEnv;

export async function initializeMakeSuite(
  starlayToken: MintableErc20,
  starlayStake: StakedAaveV3,
  incentivesController: StakedTokenIncentivesController,
  pullRewardsIncentivesController: PullRewardsIncentivesController
) {
  const [_deployer, _proxyAdmin, ...restSigners] = await getEthersSigners();
  const deployer: SignerWithAddress = {
    address: await _deployer.getAddress(),
    signer: _deployer,
  };

  const rewardsVault: SignerWithAddress = {
    address: await _deployer.getAddress(),
    signer: _deployer,
  };

  for (const signer of restSigners) {
    testEnv.users.push({
      signer,
      address: await signer.getAddress(),
    });
  }
  testEnv.deployer = deployer;
  testEnv.rewardsVault = rewardsVault;
  testEnv.stakedToken = starlayStake;
  testEnv.aaveIncentivesController = incentivesController;
  testEnv.pullRewardsIncentivesController = pullRewardsIncentivesController;
  testEnv.token = starlayToken;
  testEnv.aDaiMock = await getATokenMock({ slug: 'lDai' });
  testEnv.aWethMock = await getATokenMock({ slug: 'lWeth' });
  testEnv.aDaiBaseMock = await getATokenMock({ slug: 'lDaiBase' });
  testEnv.aWethBaseMock = await getATokenMock({ slug: 'lWethBase' });
}

export function makeSuite(name: string, tests: (testEnv: TestEnv) => void) {
  describe(name, () => {
    before(async () => {
      setBuidlerevmSnapshotId(await evmSnapshot());
    });
    tests(testEnv);
    after(async () => {
      await evmRevert(buidlerevmSnapshotId);
    });
  });
}
