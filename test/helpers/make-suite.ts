import { evmRevert, evmSnapshot, DRE } from '../../helpers/misc-utils';
import { Signer } from 'ethers';
import { getEthersSigners } from '../../helpers/contracts-helpers';
import { tEthereumAddress } from '../../helpers/types';

import chai from 'chai';
// @ts-ignore
import bignumberChai from 'chai-bignumber';
import { getLTokenMock } from '../../helpers/contracts-accessors';
import { MintableErc20 } from '../../types/MintableErc20';
import { LTokenMock } from '../../types/LTokenMock';
import {
  PullRewardsIncentivesController,
  PullRewardsIncentivesController__factory,
  StakedLayV2,
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
  incentivesController: StakedTokenIncentivesController;
  pullRewardsIncentivesController: PullRewardsIncentivesController;
  stakedToken: StakedLayV2;
  lDaiMock: LTokenMock;
  lWethMock: LTokenMock;
  lDaiBaseMock: LTokenMock;
  aWethBaseMock: LTokenMock;
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
  stakedToken: {} as StakedLayV2,
  incentivesController: {} as StakedTokenIncentivesController,
  pullRewardsIncentivesController: {} as PullRewardsIncentivesController,
  lDaiMock: {} as LTokenMock,
  lWethMock: {} as LTokenMock,
  lDaiBaseMock: {} as LTokenMock,
  aWethBaseMock: {} as LTokenMock,
} as TestEnv;

export async function initializeMakeSuite(
  starlayToken: MintableErc20,
  starlayStake: StakedLayV2,
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
  testEnv.incentivesController = incentivesController;
  testEnv.pullRewardsIncentivesController = pullRewardsIncentivesController;
  testEnv.token = starlayToken;
  testEnv.lDaiMock = await getLTokenMock({ slug: 'lDai' });
  testEnv.lWethMock = await getLTokenMock({ slug: 'lWeth' });
  testEnv.lDaiBaseMock = await getLTokenMock({ slug: 'lDaiBase' });
  testEnv.aWethBaseMock = await getLTokenMock({ slug: 'lWethBase' });
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
