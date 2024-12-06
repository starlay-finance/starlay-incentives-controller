import { expect } from 'chai';
import { BigNumber, ethers } from 'ethers';
import {
  deployLendingPoolMock,
  deployLTokenMock,
  deployPullRewardsIncentivesControllerV4,
  deployVoterMock,
} from '../../helpers/contracts-accessors';
import { LendingPoolMock, PullRewardsIncentivesControllerV4, VoterMock } from '../../types';
import { makeSuite } from '../helpers/make-suite';

type Reserve = {
  symbol: string;
  reserve: string;
  lToken: string;
  vdToken: string;
  weight: string;
  expects: {
    depositEmissionPerSecond: string;
    borrowEmissionPerSecond: string;
  };
};

const RESERVE_DATA_MOCK = {
  configuration: { data: '0' },
  liquidityIndex: '0',
  variableBorrowIndex: '0',
  currentLiquidityRate: '0',
  currentVariableBorrowRate: '0',
  currentStableBorrowRate: '0',
  lastUpdateTimestamp: '0',
  lTokenAddress: ethers.constants.AddressZero,
  stableDebtTokenAddress: ethers.constants.AddressZero,
  variableDebtTokenAddress: ethers.constants.AddressZero,
  interestRateStrategyAddress: ethers.constants.AddressZero,
  id: '0',
};

const RESERVES: Reserve[] = [
  {
    symbol: 'LAY',
    reserve: '0xc4335B1b76fA6d52877b3046ECA68F6E708a27dd',
    lToken: '',
    vdToken: '',
    weight: '0',
    expects: {
      depositEmissionPerSecond: '0',
      borrowEmissionPerSecond: '0',
    },
  },
  {
    symbol: 'ASTR',
    reserve: '0xAeaaf0e2c81Af264101B9129C00F4440cCF0F720',
    lToken: '',
    vdToken: '',
    weight: '222815335965125970016752',
    expects: {
      depositEmissionPerSecond: '99818354914244134',
      borrowEmissionPerSecond: '232909494799902980',
    },
  },
  {
    symbol: 'SDN',
    reserve: '0x75364D4F779d0Bd0facD9a218c67f87dD9Aff3b4',
    lToken: '',
    vdToken: '',
    weight: '962545580939155448695253',
    expects: {
      depositEmissionPerSecond: '43120789080583435',
      borrowEmissionPerSecond: '100615174521361349',
    },
  },
  {
    symbol: 'WETH',
    reserve: '0x81ECac0D6Be0550A00FF064a4f9dd2400585FE9c',
    lToken: '',
    vdToken: '',
    weight: '8556696080204731412518766',
    expects: {
      depositEmissionPerSecond: '383328843199159752',
      borrowEmissionPerSecond: '894433967464706089',
    },
  },
  {
    symbol: 'WBTC',
    reserve: '0xad543f18cFf85c77E140E3E5E3c3392f6Ba9d5CA',
    lToken: '',
    vdToken: '',
    weight: '2228680348101899208118458',
    expects: {
      depositEmissionPerSecond: '99841972085934252',
      borrowEmissionPerSecond: '232964601533846589',
    },
  },
  {
    symbol: 'USDT',
    reserve: '0x3795C36e7D12A8c252A20C5a7B455f7c57b60283',
    lToken: '',
    vdToken: '',
    weight: '11797152983014363284157434',
    expects: {
      depositEmissionPerSecond: '528497091715924030',
      borrowEmissionPerSecond: '1233159880670489403',
    },
  },
  {
    symbol: 'USDC',
    reserve: '0x6a2d262D56735DbA19Dd70682B39F6bE9a931D98',
    lToken: '',
    vdToken: '',
    weight: '91707203165753425075251',
    expects: {
      depositEmissionPerSecond: '410836320075406281',
      borrowEmissionPerSecond: '958618080175947990',
    },
  },
  {
    symbol: 'BUSD',
    reserve: '0x4bf769b05e832fcdc9053fffbc78ca889acb5e1e',
    lToken: '',
    vdToken: '',
    weight: '2543857067878826679427627',
    expects: {
      depositEmissionPerSecond: '113961475900520554',
      borrowEmissionPerSecond: '265910110434547959',
    },
  },
  {
    symbol: 'DAI',
    reserve: '0x6De33698e9e9b787e09d3Bd7771ef63557E148bb',
    lToken: '',
    vdToken: '',
    weight: '6345151444485070359503063',
    expects: {
      depositEmissionPerSecond: '284254518314556934',
      borrowEmissionPerSecond: '663260542733966179',
    },
  },
  {
    symbol: 'MATIC',
    reserve: '0xdd90E5E87A2081Dcf0391920868eBc2FFB81a1aF',
    lToken: '',
    vdToken: '',
    weight: '484419264683633882913978',
    expects: {
      depositEmissionPerSecond: '21701351178685614',
      borrowEmissionPerSecond: '50636486083599767',
    },
  },
  {
    symbol: 'BNB',
    reserve: '0x7f27352D5F83Db87a5A3E00f4B07Cc2138D8ee52',
    lToken: '',
    vdToken: '',
    weight: '966267764004916155254931',
    expects: {
      depositEmissionPerSecond: '43287535224855927',
      borrowEmissionPerSecond: '101004248857997165',
    },
  },
  {
    symbol: 'DOT',
    reserve: '0xffffffffffffffffffffffffffffffffffffffff',
    lToken: '',
    vdToken: '',
    weight: '4450725276933934345455337',
    expects: {
      depositEmissionPerSecond: '199386702013832785',
      borrowEmissionPerSecond: '465235638032276500',
    },
  },
];

const WEIGHTS = {
  deposit: '3',
  borrow: '7',
};

const EMISSION_PER_SECOND = '572520000000000000000000';

makeSuite('pullRewardsIncentivesControllerV4 configureAssetsWithVoter', (testEnv) => {
  let pool: LendingPoolMock;
  let voter: VoterMock;
  let controller: PullRewardsIncentivesControllerV4;
  beforeEach(async () => {
    pool = await deployLendingPoolMock();
    voter = await deployVoterMock();
    controller = await deployPullRewardsIncentivesControllerV4(testEnv.token.address);
    controller.initialize(
      testEnv.rewardsVault.address,
      pool.address,
      voter.address,
      testEnv.users[0].address
    );
    for (const reserve of RESERVES) {
      reserve.lToken = (await deployLTokenMock(controller.address, `l${reserve.symbol}`)).address;
      reserve.vdToken = (await deployLTokenMock(controller.address, `vd${reserve.symbol}`)).address;
    }
  });
  it('configureAssetsWithVoter', async () => {
    // setup
    const term = '1';
    const reserves = RESERVES;

    // pool
    await setPoolReserves(pool, reserves);

    // voter
    for (let i = 0; i < reserves.length; i++) {
      await voter.setPoolWeight(reserves[i].lToken, term, reserves[i].weight);
    }
    await voter.setTotalWeight(
      reserves.reduce<BigNumber>((res, { weight }) => res.add(weight), BigNumber.from('0'))
    );
    await voter.setCurrentTermTimestamp(term);

    // incentive
    await controller
      .connect(testEnv.users[0].signer)
      .setEmissionPerSeconds([term], [EMISSION_PER_SECOND]);

    await controller
      .connect(testEnv.users[0].signer)
      .setDepositBorrowWeight(WEIGHTS.deposit, WEIGHTS.borrow);

    // exercise
    await controller.configureAssetsWithVoter();

    // verify
    for (const reserve of reserves) {
      console.log(
        reserve.symbol,
        (await controller.assets(reserve.lToken)).emissionPerSecond,
        (await controller.assets(reserve.vdToken)).emissionPerSecond
      );
      // TODO fix conditions and exepectations
      // expect((await controller.assets(reserve.lToken)).emissionPerSecond).to.be.eq(
      //   reserve.expects.depositEmissionPerSecond
      // );
      // expect((await controller.assets(reserve.vdToken)).emissionPerSecond).to.be.eq(
      //   reserve.expects.borrowEmissionPerSecond
      // );
    }
    expect(await controller.lastAppliedTerm()).to.be.eq(term);
  });
  it('revert if no reserves configured', async () => {
    const term = 1;
    await voter.setCurrentTermTimestamp(term);
    await expect(controller.configureAssetsWithVoter()).to.be.revertedWith('No Reserves Found');
  });
  it('revert if already applied', async () => {
    const term = 1659571200;

    await setPoolReserves(pool, RESERVES);
    await voter.setCurrentTermTimestamp(term);
    await expect(controller.configureAssetsWithVoter()).not.to.be.reverted;
    expect(await controller.lastAppliedTerm()).to.be.eq(term);
    await expect(controller.configureAssetsWithVoter()).to.be.revertedWith('Already Applied');
  });
});

const setPoolReserves = async (pool: LendingPoolMock, reserves: Reserve[]) => {
  await pool.setReservesList(reserves.map(({ reserve }) => reserve));
  for (const reserve of reserves) {
    await pool.setReserveData(reserve.reserve, {
      ...RESERVE_DATA_MOCK,
      lTokenAddress: reserve.lToken,
      variableDebtTokenAddress: reserve.vdToken,
    });
  }
};
