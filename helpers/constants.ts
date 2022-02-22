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
      [eAstarNetwork.astar]: ZERO_ADDRESS,
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
      [eAstarNetwork.astar]: ZERO_ADDRESS,
      [eAstarNetwork.shiden]: '0x4cFf3b5f6bA3d64083963DE201089f3267490C65', // StakedLay
      [eAstarNetwork.shibuya]: '0xD0286b992ae9EB8702457559dCA9565bEB20b0DC', // StakedLay
    },
    network
  );

export const getEmissionManagerPerNetwork = (network: eNetwork): tEthereumAddress =>
  getParamPerNetwork<tEthereumAddress>(
    {
      [eEthereumNetwork.kovan]: '0x175d905470e85279899C37F89000b195f3d0c0C5',
      [eEthereumNetwork.rinkeby]: '0x175d905470e85279899C37F89000b195f3d0c0C5',
      [eAstarNetwork.astar]: ZERO_ADDRESS,
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
      [eAstarNetwork.astar]: ZERO_ADDRESS,
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
        LAY: ZERO_ADDRESS,
        USDC: ZERO_ADDRESS,
        USDT: ZERO_ADDRESS,
        WASTR: ZERO_ADDRESS,
        WBTC: ZERO_ADDRESS,
        WETH: ZERO_ADDRESS,
        WSDN: ZERO_ADDRESS,
      },
      [eAstarNetwork.shiden]: {
        LAY: '0xD5031cE3461690962ba8b9271458CD03FdF48874',
        USDC: '0x45e4cC25715eabf3b2c6d94FdF8cf10bD9dB6856',
        USDT: '0x7f4b5a8aEDed6cC219BE5e28837606788f61471d',
        WASTR: '0xdc5D0c415d5680dD18e4f58403CB457Af552d493',
        WBTC: '0x4dA7310567792f5636f58fB4596a878A3316825a',
        WETH: '0x58855B2D3F5c7bF4ef625Ca19472Ee3a759a62f7',
        WSDN: '0x088fB5BF7b4A02B9B8da8b781b8AC9Ac887F9C49',
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
        LAY: ZERO_ADDRESS,
        USDC: ZERO_ADDRESS,
        USDT: ZERO_ADDRESS,
        WASTR: ZERO_ADDRESS,
        WBTC: ZERO_ADDRESS,
        WETH: ZERO_ADDRESS,
        WSDN: ZERO_ADDRESS,
      },
      [eAstarNetwork.shiden]: {
        LAY: '0x2791393188C47C09Bd4109f58e6C71101F44ACbD',
        USDC: '0x8F0831E64844F60da61d5a6de858797a7E5d2319',
        USDT: '0xD4056cD2aBdf5425561dcac1a43DFcDee82C1e4f',
        WASTR: '0xe44Cb21e72f2243af971fe43b2558f84457E2afA',
        WBTC: '0x28A409CBaA4ce7C72208A31FAbD4D7EAe30a1b7D',
        WETH: '0xD507225E31964d268Cbe78F422c495c5bf4D3B9E',
        WSDN: '0x747C63f629250Dcbdbcd3ff74337b4Dab55bcd61',
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
        LAY: ZERO_ADDRESS,
        USDC: ZERO_ADDRESS,
        USDT: ZERO_ADDRESS,
        WASTR: ZERO_ADDRESS,
        WBTC: ZERO_ADDRESS,
        WETH: ZERO_ADDRESS,
        WSDN: ZERO_ADDRESS,
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
        addressProvider: ZERO_ADDRESS,
        rewardsVault: ZERO_ADDRESS,
        incentiveControllerImpl: ZERO_ADDRESS,
        incentiveControllerProxy: ZERO_ADDRESS,
        lendingPool: ZERO_ADDRESS,
        poolConfigurator: ZERO_ADDRESS,
        starlayToken: ZERO_ADDRESS,
      },
      [eAstarNetwork.shiden]: {
        addressProvider: '0xD7d6a1e58579d3a71f8cF95ABF957c3148cCd051',
        rewardsVault: ZERO_ADDRESS,
        incentiveControllerImpl: '0x7A57bFbCAbBf7180138D09A74535aF57417bf6b2',
        incentiveControllerProxy: '0x51e27157845bf1B72A5493F539680203B1727438',
        lendingPool: '0x05De09054438FEf452525b3728D688e2DcE33c89',
        poolConfigurator: '0x202f0cFeC6dc424346712b1aEc1C7cea8f49C34d',
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
