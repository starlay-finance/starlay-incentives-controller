import BigNumber from 'bignumber.js';
import { getParamPerNetwork } from './contracts-helpers';
import { eAstarNetwork, eEthereumNetwork, eNetwork, tEthereumAddress } from './types';

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
export const getProxyAdminPerNetwork = (network: eNetwork): tEthereumAddress => getParamPerNetwork<tEthereumAddress>(
  {
    [eEthereumNetwork.kovan]: '0x6543076E4315bd82129105890Bc49c18f496a528', // Dummy
    [eEthereumNetwork.rinkeby]: '0x6543076E4315bd82129105890Bc49c18f496a528', // Dummy
    [eAstarNetwork.astar]: ZERO_ADDRESS,
    [eAstarNetwork.shiden]: ZERO_ADDRESS,
    [eAstarNetwork.shibuya]: '0x6543076E4315bd82129105890Bc49c18f496a528' // Dummy
  },
  network
);

export const getStakedTokenPerNetwork = (network: eNetwork): tEthereumAddress => getParamPerNetwork<tEthereumAddress>(
  {
    [eEthereumNetwork.kovan]: '0x82ab55Ff927d0E3C42A6Bc08C0B57D35A7896880', // StakedLay
    [eEthereumNetwork.rinkeby]: '0x542d2690d8B4092F455188622dA51ee478cAD0E0', // StakedLay
    [eAstarNetwork.astar]: ZERO_ADDRESS,
    [eAstarNetwork.shiden]: ZERO_ADDRESS,
    [eAstarNetwork.shibuya]: '0xD0286b992ae9EB8702457559dCA9565bEB20b0DC' // StakedLay
  },
  network
);

export const getEmissionManagerPerNetwork = (network: eNetwork): tEthereumAddress => getParamPerNetwork<tEthereumAddress>(
  {
    [eEthereumNetwork.kovan]: '0x175d905470e85279899C37F89000b195f3d0c0C5',
    [eEthereumNetwork.rinkeby]: '0x175d905470e85279899C37F89000b195f3d0c0C5',
    [eAstarNetwork.astar]: ZERO_ADDRESS,
    [eAstarNetwork.shiden]: ZERO_ADDRESS,
    [eAstarNetwork.shibuya]: '0x175d905470e85279899C37F89000b195f3d0c0C5'
  },
  network
);

export const getRewardVaultPerNetwork = (network: eNetwork): tEthereumAddress => getParamPerNetwork<tEthereumAddress>(
  {
    [eEthereumNetwork.kovan]: ZERO_ADDRESS,
    [eEthereumNetwork.rinkeby]: ZERO_ADDRESS,
    [eAstarNetwork.astar]: ZERO_ADDRESS,
    [eAstarNetwork.shiden]: ZERO_ADDRESS,
    [eAstarNetwork.shibuya]: ZERO_ADDRESS
  },
  network
);