// @ts-ignore
import { eAstarNetwork, eEthereumNetwork, iParamsPerNetwork } from './helpers/types';

require('dotenv').config();

const INFURA_KEY = process.env.INFURA_KEY || '';
const ALCHEMY_KEY = process.env.ALCHEMY_KEY || '';
const BWARE_LABS_KEY = process.env.BWARE_LABS_KEY || '';
const TENDERLY_FORK_ID = process.env.TENDERLY_FORK_ID || '';

const GWEI = 1000 * 1000 * 1000;

export const NETWORKS_RPC_URL: iParamsPerNetwork<string> = {
  [eEthereumNetwork.kovan]: ALCHEMY_KEY
    ? `https://eth-kovan.alchemyapi.io/v2/${ALCHEMY_KEY}`
    : `https://kovan.infura.io/v3/${INFURA_KEY}`,
  [eEthereumNetwork.rinkeby]: ALCHEMY_KEY
    ? `https://eth-rinkeby.alchemyapi.io/v2/${ALCHEMY_KEY}`
    : `https://rinkeby.infura.io/v3/${INFURA_KEY}`,
  [eEthereumNetwork.main]: ALCHEMY_KEY
    ? `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`
    : `https://mainnet.infura.io/v3/${INFURA_KEY}`,
  [eEthereumNetwork.coverage]: 'http://localhost:8555',
  [eEthereumNetwork.hardhat]: 'http://localhost:8545',
  [eEthereumNetwork.buidlerevm]: 'http://localhost:8545',
  [eEthereumNetwork.tenderlyMain]: `https://rpc.tenderly.co/fork/${TENDERLY_FORK_ID}`,
  [eAstarNetwork.astar]: BWARE_LABS_KEY
    ? `https://astar-api.bwarelabs.com/${BWARE_LABS_KEY}`
    : 'https://rpc.astar.network:8545',
  [eAstarNetwork.shiden]: BWARE_LABS_KEY
    ? `https://shiden-api.bwarelabs.com/${BWARE_LABS_KEY}`
    : 'https://shiden.api.onfinality.io/public',
  [eAstarNetwork.shibuya]: BWARE_LABS_KEY
    ? `https://shibuya-api.bwarelabs.com/${BWARE_LABS_KEY}`
    : 'https://rpc.shibuya.astar.network:8545',
};

export const NETWORKS_DEFAULT_GAS: iParamsPerNetwork<number> = {
  [eEthereumNetwork.kovan]: 1 * GWEI,
  [eEthereumNetwork.rinkeby]: 1 * GWEI,
  [eEthereumNetwork.main]: 180 * GWEI,
  [eEthereumNetwork.coverage]: 1 * GWEI,
  [eEthereumNetwork.hardhat]: 1 * GWEI,
  [eEthereumNetwork.buidlerevm]: 1 * GWEI,
  [eEthereumNetwork.tenderlyMain]: 1 * GWEI,
  [eAstarNetwork.astar]: 10 * GWEI,
  [eAstarNetwork.shiden]: 1 * GWEI,
  [eAstarNetwork.shibuya]: 1 * GWEI,
};
