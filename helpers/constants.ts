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
      [eAstarNetwork.astar]: '0xE2aca8Aeb4422B0dd0BD227bacfa18300E6c9ee2', // Proxy-StakedTokenV2Rev3
      [eAstarNetwork.shiden]: '0x775c51Cb780782ae10Ed20A7672F442D3c893ae3', // Proxy-StakedTokenV2Rev3
      [eAstarNetwork.shibuya]: '0xD0286b992ae9EB8702457559dCA9565bEB20b0DC', // StakedLay
    },
    network
  );

export const getEmissionManagerPerNetwork = (network: eNetwork): tEthereumAddress =>
  getParamPerNetwork<tEthereumAddress>(
    {
      [eEthereumNetwork.kovan]: '0x175d905470e85279899C37F89000b195f3d0c0C5',
      [eEthereumNetwork.rinkeby]: '0x175d905470e85279899C37F89000b195f3d0c0C5',
      [eAstarNetwork.astar]: '0x175d905470e85279899C37F89000b195f3d0c0C5',
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
      [eAstarNetwork.astar]: '0x06aBB8782C91EEB459862e09262E8cEbcA98E568',
      [eAstarNetwork.shiden]: '0x175d905470e85279899C37F89000b195f3d0c0C5',
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
      },
      [eEthereumNetwork.rinkeby]: {
        LAY: ZERO_ADDRESS,
        USDC: ZERO_ADDRESS,
        USDT: ZERO_ADDRESS,
        WASTR: ZERO_ADDRESS,
        WBTC: ZERO_ADDRESS,
        WETH: ZERO_ADDRESS,
        WSDN: ZERO_ADDRESS,
      },
      [eAstarNetwork.astar]: {
        LAY: '0xe253564619e894E049F3e59C36752243Ff953942',
        USDC: '0x5F2b559A087d5EF3027FBdFED87005F9196e6B3c',
        USDT: '0xFAC6300D4FfE51202da8CB90c27db2620E2152E2',
        WASTR: '0xc0e032169b72c1F929816E940a8cE6608c6A6197',
        WBTC: '0xd635a8Dfa3a467fB76a01E43023c3db3A6E959a1',
        WETH: '0x25C41a0E7c596D8a3C678B4d5b26C94a31b5D936',
        WSDN: '0xaF532e8D13f41B06202B868dBb22d900FaD5A060',
      },
      [eAstarNetwork.shiden]: {
        LAY: '0x6cB67bC355b8f3cB5318bF25b09d7c49D1f3fd71',
        USDC: '0x4e0056232909aa10D91D8F6949472A145e78928b',
        USDT: '0x2BCd0E0315a9Fe6d82632f42bCd186B8403B06ab',
        WASTR: '0x0ae9f66D4C6a8cF4C1b27F91a91C4360c9a77677',
        WBTC: '0x70F2fE1aFA14F4091657a2EaaBBfC5990CaA899b',
        WETH: '0xFAB0463d81Dfe662191899dD82eDD28a101fb33F',
        WSDN: '0x18698220c210De8C86FEcA2398676638CbBF0844',
      },
      [eAstarNetwork.shibuya]: {
        LAY: ZERO_ADDRESS,
        USDC: ZERO_ADDRESS,
        USDT: ZERO_ADDRESS,
        WASTR: ZERO_ADDRESS,
        WBTC: ZERO_ADDRESS,
        WETH: ZERO_ADDRESS,
        WSDN: ZERO_ADDRESS,
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
      },
      [eEthereumNetwork.rinkeby]: {
        LAY: ZERO_ADDRESS,
        USDC: ZERO_ADDRESS,
        USDT: ZERO_ADDRESS,
        WASTR: ZERO_ADDRESS,
        WBTC: ZERO_ADDRESS,
        WETH: ZERO_ADDRESS,
        WSDN: ZERO_ADDRESS,
      },
      [eAstarNetwork.astar]: {
        LAY: '0x587b9ae6a523791379Cc2545eb6677820F4ed29A',
        USDC: '0x59871cB99c86664665083A40AF50809A929ddea4',
        USDT: '0x7423f73052657C1908C0bD89c45392cD979191DB',
        WASTR: '0x87570FC6B545b94cd9252C92F1bD0857c152D497',
        WBTC: '0x0BF7dAf2FD094844bd4DA80b3540d0d0228e80eC',
        WETH: '0x751f3Da058A95b9A28b3927eB2dbf148B2Dca58B',
        WSDN: '0x48eBc5c7cd831fc2a1Eb058DbC91f21ED183DDdb',
      },
      [eAstarNetwork.shiden]: {
        LAY: '0x3384B17Ac05376D53c49023258505b3531037d74',
        USDC: '0x29FFC790fBb4989b109E552cDE0c31639f7412E2',
        USDT: '0x2986480C06518059e616e8452222FaAFd7c1F6Ec',
        WASTR: '0x303A991fB00915fe90fde551164e5940362E16c4',
        WBTC: '0xB396839D422a2B907443B79D68BBdc27A26D1bBB',
        WETH: '0xbd2efe07F0EB8af477DE3e514ae6Da4F55001123',
        WSDN: '0xc35b7d9756e9447f64c0D3c5588769aB2cC9EB4a',
      },
      [eAstarNetwork.shibuya]: {
        LAY: ZERO_ADDRESS,
        USDC: ZERO_ADDRESS,
        USDT: ZERO_ADDRESS,
        WASTR: ZERO_ADDRESS,
        WBTC: ZERO_ADDRESS,
        WETH: ZERO_ADDRESS,
        WSDN: ZERO_ADDRESS,
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
      },
      [eEthereumNetwork.rinkeby]: {
        LAY: ZERO_ADDRESS,
        USDC: ZERO_ADDRESS,
        USDT: ZERO_ADDRESS,
        WASTR: ZERO_ADDRESS,
        WBTC: ZERO_ADDRESS,
        WETH: ZERO_ADDRESS,
        WSDN: ZERO_ADDRESS,
      },
      [eAstarNetwork.astar]: {
        LAY: '0x026734Fb820F072a0FbA1D49A60E4f545F9804a1',
        USDC: '0x6a2d262D56735DbA19Dd70682B39F6bE9a931D98',
        USDT: '0x3795C36e7D12A8c252A20C5a7B455f7c57b60283',
        WASTR: '0xAeaaf0e2c81Af264101B9129C00F4440cCF0F720',
        WBTC: '0xad543f18cFf85c77E140E3E5E3c3392f6Ba9d5CA',
        WETH: '0x81ECac0D6Be0550A00FF064a4f9dd2400585FE9c',
        WSDN: '0x75364D4F779d0Bd0facD9a218c67f87dD9Aff3b4',
      },
      [eAstarNetwork.shiden]: {
        LAY: '0xb163716cb6c8b0a56e4f57c394A50F173E34181b',
        USDC: '0x458db3bEf6ffC5212f9359bbDAeD0D5A58129397',
        USDT: '0xdB25FDCCe3E63B376D308dC2D46234632d9959d8',
        WASTR: '0x44a26AE046a01d99eBAbecc24B4d61B388656871',
        WBTC: '0xEdAA9f408ac11339766a4E5e0d4653BDee52fcA1',
        WETH: '0x72fE832eB0452285e91CA9F46B85229A5107CeE8',
        WSDN: '0x7cA69766F4be8Ec93dD01E1d571e64b867455e58',
      },
      [eAstarNetwork.shibuya]: {
        LAY: ZERO_ADDRESS,
        USDC: ZERO_ADDRESS,
        USDT: ZERO_ADDRESS,
        WASTR: ZERO_ADDRESS,
        WBTC: ZERO_ADDRESS,
        WETH: ZERO_ADDRESS,
        WSDN: ZERO_ADDRESS,
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
        addressProvider: '0x6F540CdF68a913e64E5E271d2B7CaaEddd99e72A',
        rewardsVault: '0x06aBB8782C91EEB459862e09262E8cEbcA98E568', // Dummy
        incentiveControllerImpl: '0xe809aFAec7bedcB55597025db7E1a716d83dF2fE',
        incentiveControllerProxy: '0x0684B5972f320B1F4e810b6432Cb8190B2D6cA7b',
        lendingPool: '0x39aa77Aa50dDC4a1d77074891E761f5B73092c79',
        poolConfigurator: '0x66EE292e5B75568bb38fDDa691D074B21E057465',
        starlayToken: '0x026734Fb820F072a0FbA1D49A60E4f545F9804a1',
      },
      [eAstarNetwork.shiden]: {
        addressProvider: '0x8cB4F3EEE04BB847B5176366ACB7AE92AF80e51e',
        rewardsVault: ZERO_ADDRESS,
        incentiveControllerImpl: '0xab5cC5EaA2CE77f89d56A2f6B1df1c42ECb13004',
        incentiveControllerProxy: '0x3983E51e775A98fFAb20D6ed034086ab900CFBBF',
        lendingPool: '0xdC44E14CBb5949E8F8530D47f0e531B529b45714',
        poolConfigurator: '0x498B1C69d6A76ea92a9E882aE22b71fdAF2f2775',
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
