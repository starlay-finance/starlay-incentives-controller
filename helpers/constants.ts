import { testDeployIncentivesController } from './../test/helpers/deploy';
import BigNumber from 'bignumber.js';
import { getParamPerNetwork } from './contracts-helpers';
import {
  eAstarNetwork,
  eEthereumNetwork,
  eNetwork,
  tEthereumAddress,
  iParamsPerNetwork,
  iAssetBase,
  incentivesConfig,
} from './types';

// ----------------
// MATH
// ----------------

export const PERCENTAGE_FACTOR = '10000';
export const HALF_PERCENTAGE = '5000';
export const WAD = Math.pow(10, 18).toString();
export const HALF_WAD = new BigNumber(WAD).multipliedBy(0.5).toString();
export const RAY = new BigNumber(10).exponentiatedBy(27).toFixed();
export const HALF_RAY = new BigNumber(RAY).multipliedBy(0.5).toFixed();
export const WAD_RAY_RATIO = Math.pow(10, 9).toString();
export const oneEther = new BigNumber(Math.pow(10, 18));
export const oneRay = new BigNumber(Math.pow(10, 27));
export const MAX_UINT_AMOUNT =
  '115792089237316195423570985008687907853269984665640564039457584007913129639935';
export const ONE_YEAR = '31536000';
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export const ONE_ADDRESS = '0x0000000000000000000000000000000000000001';

/* Buidler/Hardhat constants */

export const TEST_SNAPSHOT_ID = '0x1';
export const BUIDLEREVM_CHAINID = 31337;
export const COVERAGE_CHAINID = 1337;

export const RANDOM_ADDRESSES = [
  '0x0000000000000000000000000000000000000221',
  '0x0000000000000000000000000000000000000321',
  '0x0000000000000000000000000000000000000211',
  '0x0000000000000000000000000000000000000251',
  '0x0000000000000000000000000000000000000271',
  '0x0000000000000000000000000000000000000291',
  '0x0000000000000000000000000000000000000321',
  '0x0000000000000000000000000000000000000421',
  '0x0000000000000000000000000000000000000521',
  '0x0000000000000000000000000000000000000621',
  '0x0000000000000000000000000000000000000721',
];

/* Addresses / Parameters for each network */
export const getProxyAdminPerNetwork = (network: eNetwork): tEthereumAddress =>
  getParamPerNetwork<tEthereumAddress>(
    {
      [eEthereumNetwork.kovan]: '0x6543076E4315bd82129105890Bc49c18f496a528', // Dummy
      [eEthereumNetwork.rinkeby]: '0x6543076E4315bd82129105890Bc49c18f496a528', // Dummy
      [eAstarNetwork.astar]: '0x6543076E4315bd82129105890Bc49c18f496a528', // Dummy
      [eAstarNetwork.shiden]: '0x6543076E4315bd82129105890Bc49c18f496a528', // Dummy
      [eAstarNetwork.shibuya]: '0x6543076E4315bd82129105890Bc49c18f496a528', // Dummy
    },
    network
  );

export const getStakedTokenPerNetwork = (network: eNetwork): tEthereumAddress =>
  getParamPerNetwork<tEthereumAddress>(
    {
      [eEthereumNetwork.kovan]: '0x82ab55Ff927d0E3C42A6Bc08C0B57D35A7896880', // StakedLay
      [eEthereumNetwork.rinkeby]: '0x542d2690d8B4092F455188622dA51ee478cAD0E0', // StakedLay
      [eAstarNetwork.astar]: '0x6FD65f71B3FB5Aa9d794f010AFc65F174012994F', // Proxy-StakedTokenV2Rev3
      [eAstarNetwork.shiden]: '0x87DCF20F2bf4A772a70BdDA142288820bd3Bdf5A', // Proxy-StakedTokenV2Rev3
      [eAstarNetwork.shibuya]: '0xD0286b992ae9EB8702457559dCA9565bEB20b0DC', // StakedLay
    },
    network
  );

export const getLayTokenPerNetwork = (network: eNetwork): tEthereumAddress =>
  getParamPerNetwork<tEthereumAddress>(
    {
      [eEthereumNetwork.kovan]: '',
      [eEthereumNetwork.rinkeby]: '',
      [eAstarNetwork.astar]: '',
      [eAstarNetwork.shiden]: '0xb163716cb6c8b0a56e4f57c394A50F173E34181b',
      [eAstarNetwork.shibuya]: '',
    },
    network
  );

export const getEmissionManagerPerNetwork = (network: eNetwork): tEthereumAddress =>
  getParamPerNetwork<tEthereumAddress>(
    {
      [eEthereumNetwork.kovan]: '0x175d905470e85279899C37F89000b195f3d0c0C5',
      [eEthereumNetwork.rinkeby]: '0x175d905470e85279899C37F89000b195f3d0c0C5',
      [eAstarNetwork.astar]: '0xed81c007113D8E532954B735B683260776F3c297',
      [eAstarNetwork.shiden]: '0x175d905470e85279899C37F89000b195f3d0c0C5',
      [eAstarNetwork.shibuya]: '0x175d905470e85279899C37F89000b195f3d0c0C5',
    },
    network
  );

export const getRewardVaultPerNetwork = (network: eNetwork): tEthereumAddress =>
  getParamPerNetwork<tEthereumAddress>(
    {
      [eEthereumNetwork.kovan]: ZERO_ADDRESS,
      [eEthereumNetwork.rinkeby]: ZERO_ADDRESS,
      [eAstarNetwork.astar]: '0x4C9d9C197880810724b8eCC3b47b279C9763EC2B',
      [eAstarNetwork.shiden]: '0x6c08Fa7210c69Cc258729E8d864dE05bd1A2E7BD',
      [eAstarNetwork.shibuya]: ZERO_ADDRESS,
    },
    network
  );

export const getlTokenAddressPerNetwork = (network: eNetwork): iAssetBase<tEthereumAddress> =>
  getParamPerNetwork<iAssetBase<tEthereumAddress>>(
    {
      [eEthereumNetwork.kovan]: {
        LAY: ZERO_ADDRESS,
        USDC: ZERO_ADDRESS,
        USDT: ZERO_ADDRESS,
        WASTR: ZERO_ADDRESS,
        WBTC: ZERO_ADDRESS,
        WETH: ZERO_ADDRESS,
        WSDN: ZERO_ADDRESS,
        DAI: ZERO_ADDRESS,
        BUSD: ZERO_ADDRESS,
        MATIC: ZERO_ADDRESS,
        BNB: ZERO_ADDRESS,
      },
      [eEthereumNetwork.rinkeby]: {
        LAY: ZERO_ADDRESS,
        USDC: ZERO_ADDRESS,
        USDT: ZERO_ADDRESS,
        WASTR: ZERO_ADDRESS,
        WBTC: ZERO_ADDRESS,
        WETH: ZERO_ADDRESS,
        WSDN: ZERO_ADDRESS,
        DAI: ZERO_ADDRESS,
        BUSD: ZERO_ADDRESS,
        MATIC: ZERO_ADDRESS,
        BNB: ZERO_ADDRESS,
      },
      [eAstarNetwork.astar]: {
        LAY: '0x70A91e490Fd089fC8b2a3432858800AFB6Ceb539',
        USDC: '0xC404E12D3466acCB625c67dbAb2E1a8a457DEf3c',
        USDT: '0x430D50963d9635bBef5a2fF27BD0bDDc26ed691F',
        WASTR: '0xc0043Ad81De6DB53a604e42377290EcfD4Bc5fED',
        WBTC: '0x93E008010B17a48A140EEA4283040adD92eAC576',
        WETH: '0x61f5df7076D2BA75323129CC2724db3abDdC3073',
        WSDN: '0x2308De041865503B3b24F5da4D1ab7308c4ff756',
        BUSD: '0xb7aB962c42A8Bb443e0362f58a5A43814c573FFb',
        DAI: '0x4dd9c468A44F3FEF662c35c1E9a6108B70415C2c',
        MATIC: '0xF49Ab32B1B13A50eEe2022347A31a69524E83671',
        BNB: '0xd37991C23242439B0549c8328df5d83897D645AA',
      },
      [eAstarNetwork.shiden]: {
        LAY: '0x5E580CFfd8948DdDFfd42F36655b28ea3C6eD5ae',
        USDC: '0xF4D80e698D40Aae4F8486E59D3A52BB4b637e867',
        USDT: '0xFa668E06fe382ECb6ADBad15108357c1125aF906',
        WASTR: '0x0a3c24FC967af171CF3Cf24fc46a9e5247d51BF1',
        WBTC: '0xeEF36e87e130Eed43B5a3F81be4702F2f7A0c205',
        WETH: '0xaE6AA78668bC2A1fE5800dcDdd87345C0cE801b9',
        WSDN: '0xeAEaEfDfB40205EfEb18FD2e85D1d1173c53448A',
        BUSD: '0xB8447E00be2281e4744fCeC1Aa5BB9216be70d3d',
        DAI: '0x59448269aa5Cb875F27268368bB1913bF60580aD',
        MATIC: '0x61641f8Db169E26809f4CE542327caBCfD9BA8A2',
        BNB: '0x9AcE7af4A5Ec0df8e9D3da8218D064ce92D67097',
      },
      [eAstarNetwork.shibuya]: {
        LAY: ZERO_ADDRESS,
        USDC: ZERO_ADDRESS,
        USDT: ZERO_ADDRESS,
        WASTR: ZERO_ADDRESS,
        WBTC: ZERO_ADDRESS,
        WETH: ZERO_ADDRESS,
        WSDN: ZERO_ADDRESS,
        DAI: ZERO_ADDRESS,
        BUSD: ZERO_ADDRESS,
        MATIC: ZERO_ADDRESS,
        BNB: ZERO_ADDRESS,
      },
    },
    network
  );
export const getVdTokenAddressPerNetwork = (network: eNetwork): iAssetBase<tEthereumAddress> =>
  getParamPerNetwork<iAssetBase<tEthereumAddress>>(
    {
      [eEthereumNetwork.kovan]: {
        LAY: ZERO_ADDRESS,
        USDC: ZERO_ADDRESS,
        USDT: ZERO_ADDRESS,
        WASTR: ZERO_ADDRESS,
        WBTC: ZERO_ADDRESS,
        WETH: ZERO_ADDRESS,
        WSDN: ZERO_ADDRESS,
        DAI: ZERO_ADDRESS,
        BUSD: ZERO_ADDRESS,
        MATIC: ZERO_ADDRESS,
        BNB: ZERO_ADDRESS,
      },
      [eEthereumNetwork.rinkeby]: {
        LAY: ZERO_ADDRESS,
        USDC: ZERO_ADDRESS,
        USDT: ZERO_ADDRESS,
        WASTR: ZERO_ADDRESS,
        WBTC: ZERO_ADDRESS,
        WETH: ZERO_ADDRESS,
        WSDN: ZERO_ADDRESS,
        DAI: ZERO_ADDRESS,
        BUSD: ZERO_ADDRESS,
        MATIC: ZERO_ADDRESS,
        BNB: ZERO_ADDRESS,
      },
      [eAstarNetwork.astar]: {
        LAY: '0xf75e34F38A4c610644F6Fae57b9Eb80B209Cb497',
        USDC: '0xd3270b3249Fa2F0ea85231311524229fF536ee0f',
        USDT: '0xfD001Ed8A6AefaA16a2A8673f9Ec5Ccbbb4ba38C',
        WASTR: '0x5c00f026397379b70c6089C74E416b9797fdeab0',
        WBTC: '0x8c2e483aCF644190123BC46719c6D611466F9835',
        WETH: '0x3D1e61a9c47b67FD990583d07Fe0c6C54AaFF42b',
        WSDN: '0xd4Eabc34bD5F8837B378d6bf8f8A2F645200DC21',
        BUSD: '0xB3D6A83491E251bE0e9c21C8D84F88e15F6D9B15',
        DAI: '0x05F3Ca23EB9A2B9142Fb10CDaB1750B4D2162aC2',
        MATIC: '0xaED1B0Bf69f04177EDDe9B367a9AF85b1026701B',
        BNB: '0xAaf6b0D4adBEEb476Be5665F60E64bD2977DA393',
      },
      [eAstarNetwork.shiden]: {
        LAY: '0x460cB4C2087ebe58ae4687cD788385840aC39cF2',
        USDC: '0xc8c8bf3bFE12B20a74B4DF3B06cf1662bE7A2Edd',
        USDT: '0xC84d1e5b5BA7Db2848FB06d76999cDc4cec05c75',
        WASTR: '0x8fa7f0378DD149589A5056c1276e2dc19CD25eF3',
        WBTC: '0x4930A4A701034714Bc4758718945C59f8eaE8e32',
        WETH: '0x598D933DEdd22588461B4C2caa3cc85E3B8B0B97',
        WSDN: '0xC27cD77dF7F7920cb12091A2896F6Ec72de064C1',
        BUSD: '0x7aD6b84C73BbA1e5553B123e8e22CEBA8BD2705e',
        DAI: '0x55DC4F4A2e633E6249c36cc93C97b537DC9B1CFb',
        MATIC: '0x0159f0Ee7C4c5eE95eD173ea23EC89694c851201',
        BNB: '0x4dde6818CB50e329CDda1d5c68606f574637cB31',
      },
      [eAstarNetwork.shibuya]: {
        LAY: ZERO_ADDRESS,
        USDC: ZERO_ADDRESS,
        USDT: ZERO_ADDRESS,
        WASTR: ZERO_ADDRESS,
        WBTC: ZERO_ADDRESS,
        WETH: ZERO_ADDRESS,
        WSDN: ZERO_ADDRESS,
        DAI: ZERO_ADDRESS,
        BUSD: ZERO_ADDRESS,
        MATIC: ZERO_ADDRESS,
        BNB: ZERO_ADDRESS,
      },
    },
    network
  );
export const getTokenAddressPerNetwork = (network: eNetwork): iAssetBase<tEthereumAddress> =>
  getParamPerNetwork<iAssetBase<tEthereumAddress>>(
    {
      [eEthereumNetwork.kovan]: {
        LAY: ZERO_ADDRESS,
        USDC: ZERO_ADDRESS,
        USDT: ZERO_ADDRESS,
        WASTR: ZERO_ADDRESS,
        WBTC: ZERO_ADDRESS,
        WETH: ZERO_ADDRESS,
        WSDN: ZERO_ADDRESS,
        DAI: ZERO_ADDRESS,
        BUSD: ZERO_ADDRESS,
        MATIC: ZERO_ADDRESS,
        BNB: ZERO_ADDRESS,
      },
      [eEthereumNetwork.rinkeby]: {
        LAY: ZERO_ADDRESS,
        USDC: ZERO_ADDRESS,
        USDT: ZERO_ADDRESS,
        WASTR: ZERO_ADDRESS,
        WBTC: ZERO_ADDRESS,
        WETH: ZERO_ADDRESS,
        WSDN: ZERO_ADDRESS,
        DAI: ZERO_ADDRESS,
        BUSD: ZERO_ADDRESS,
        MATIC: ZERO_ADDRESS,
        BNB: ZERO_ADDRESS,
      },
      [eAstarNetwork.astar]: {
        LAY: '0xc4335B1b76fA6d52877b3046ECA68F6E708a27dd',
        USDC: '0x6a2d262D56735DbA19Dd70682B39F6bE9a931D98',
        USDT: '0x3795C36e7D12A8c252A20C5a7B455f7c57b60283',
        WASTR: '0xAeaaf0e2c81Af264101B9129C00F4440cCF0F720',
        WBTC: '0xad543f18cFf85c77E140E3E5E3c3392f6Ba9d5CA',
        WETH: '0x81ECac0D6Be0550A00FF064a4f9dd2400585FE9c',
        WSDN: '0x75364D4F779d0Bd0facD9a218c67f87dD9Aff3b4',
        BUSD: '0x4bf769b05e832fcdc9053fffbc78ca889acb5e1e',
        DAI: '0x6De33698e9e9b787e09d3Bd7771ef63557E148bb',
        MATIC: '0xdd90E5E87A2081Dcf0391920868eBc2FFB81a1aF',
        BNB: '0x7f27352D5F83Db87a5A3E00f4B07Cc2138D8ee52',
      },
      [eAstarNetwork.shiden]: {
        LAY: '0xb163716cb6c8b0a56e4f57c394A50F173E34181b',
        USDC: '0x458db3bEf6ffC5212f9359bbDAeD0D5A58129397',
        USDT: '0xdB25FDCCe3E63B376D308dC2D46234632d9959d8',
        WASTR: '0x44a26AE046a01d99eBAbecc24B4d61B388656871',
        WBTC: '0xEdAA9f408ac11339766a4E5e0d4653BDee52fcA1',
        WETH: '0x72fE832eB0452285e91CA9F46B85229A5107CeE8',
        WSDN: '0x7cA69766F4be8Ec93dD01E1d571e64b867455e58',
        DAI: '0x257f1a047948f73158DaDd03eB84b34498bCDc60',
        BUSD: '0x0156412a53C6cc607135C7D6374913C5DDF8E55E',
        MATIC: '0xb0107B84C41eD7bda37495D318116FC42826a423',
        BNB: '0x9AcE7af4A5Ec0df8e9D3da8218D064ce92D67097',
      },
      [eAstarNetwork.shibuya]: {
        LAY: ZERO_ADDRESS,
        USDC: ZERO_ADDRESS,
        USDT: ZERO_ADDRESS,
        WASTR: ZERO_ADDRESS,
        WBTC: ZERO_ADDRESS,
        WETH: ZERO_ADDRESS,
        WSDN: ZERO_ADDRESS,
        DAI: ZERO_ADDRESS,
        BUSD: ZERO_ADDRESS,
        MATIC: ZERO_ADDRESS,
        BNB: ZERO_ADDRESS,
      },
    },
    network
  );

export const getIncentivesConfigPerNetwork = (network: eNetwork): incentivesConfig =>
  getParamPerNetwork<incentivesConfig>(
    {
      [eEthereumNetwork.kovan]: {
        addressProvider: ZERO_ADDRESS,
        rewardsVault: ZERO_ADDRESS,
        incentiveControllerImpl: ZERO_ADDRESS,
        incentiveControllerProxy: ZERO_ADDRESS,
        lendingPool: ZERO_ADDRESS,
        poolConfigurator: ZERO_ADDRESS,
        starlayToken: ZERO_ADDRESS,
      },
      [eEthereumNetwork.rinkeby]: {
        addressProvider: ZERO_ADDRESS,
        rewardsVault: ZERO_ADDRESS,
        incentiveControllerImpl: ZERO_ADDRESS,
        incentiveControllerProxy: ZERO_ADDRESS,
        lendingPool: ZERO_ADDRESS,
        poolConfigurator: ZERO_ADDRESS,
        starlayToken: ZERO_ADDRESS,
      },
      [eAstarNetwork.astar]: {
        addressProvider: '0x4c37A76Bf49c01f91E275d5257a228dad1b74EF9',
        rewardsVault: '0x4C9d9C197880810724b8eCC3b47b279C9763EC2B',
        incentiveControllerImpl: '0x83e98264Cd6f39D41501e5ef86a8b924BCC82D1e',
        incentiveControllerProxy: '0x97Ab79B80E8904214413D8219E8B04373D1030AD',
        lendingPool: '0x90384334333f3356eFDD5b20016350843b90f182',
        poolConfigurator: '0xa1c2ED9e0d09f5e441aC9C44AFa308D38dAf463c',
        starlayToken: '0xc4335B1b76fA6d52877b3046ECA68F6E708a27dd',
      },
      [eAstarNetwork.shiden]: {
        addressProvider: '0xa70fFbaFE4B048798bBCBDdfB995fcCec2D1f2CA',
        rewardsVault: '0x6c08Fa7210c69Cc258729E8d864dE05bd1A2E7BD',
        incentiveControllerImpl: '0x5CfD4e63d07D10E9571Def6F26265bCa9B25130f',
        incentiveControllerProxy: '0xD9F3bbC743b7AF7E1108653Cd90E483C03D6D699',
        lendingPool: '0x8022327a333eAeFaD46A723CDcA1aeFdA12afA53',
        poolConfigurator: '0x1aE33143380567fe1246bE4Be5008B7bFa25790A',
        starlayToken: '0xb163716cb6c8b0a56e4f57c394A50F173E34181b',
      },
      [eAstarNetwork.shibuya]: {
        addressProvider: ZERO_ADDRESS,
        rewardsVault: ZERO_ADDRESS,
        incentiveControllerImpl: ZERO_ADDRESS,
        incentiveControllerProxy: ZERO_ADDRESS,
        lendingPool: ZERO_ADDRESS,
        poolConfigurator: ZERO_ADDRESS,
        starlayToken: ZERO_ADDRESS,
      },
    },
    network
  );
