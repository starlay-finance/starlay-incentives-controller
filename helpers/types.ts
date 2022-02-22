import BigNumber from 'bignumber.js';

export interface SymbolMap<T> {
  [symbol: string]: T;
}

export type eNetwork = eEthereumNetwork | eAstarNetwork;

export enum eContractid {
  DistributionManager = 'DistributionManager',
  MintableErc20 = 'MintableErc20',
  LTokenMock = 'LTokenMock',
  IERC20Detailed = 'IERC20Detailed',
  StakedTokenIncentivesController = 'StakedTokenIncentivesController',
  MockSelfDestruct = 'MockSelfDestruct',
  StakedLayV2 = 'StakedLayV2',
  PullRewardsIncentivesController = 'PullRewardsIncentivesController',
}

export enum eEthereumNetwork {
  buidlerevm = 'buidlerevm',
  kovan = 'kovan',
  rinkeby = 'rinkeby',
  main = 'main',
  coverage = 'coverage',
  hardhat = 'hardhat',
  tenderlyMain = 'tenderlyMain',
}

export enum eAstarNetwork {
  astar = 'astar',
  shiden = 'shiden',
  shibuya = 'shibuya',
}

export enum EthereumNetworkNames {
  kovan = 'kovan',
  main = 'main',
}

export type iParamsPerNetwork<T> = iEthereumParamsPerNetwork<T> | iAstarParamsPerNetwork<T>;

export interface iEthereumParamsPerNetwork<T> {
  [eEthereumNetwork.coverage]: T;
  [eEthereumNetwork.buidlerevm]: T;
  [eEthereumNetwork.kovan]: T;
  [eEthereumNetwork.rinkeby]: T;
  [eEthereumNetwork.main]: T;
  [eEthereumNetwork.hardhat]: T;
  [eEthereumNetwork.tenderlyMain]: T;
}

export interface iAstarParamsPerNetwork<T> {
  [eAstarNetwork.astar]: T;
  [eAstarNetwork.shiden]: T;
  [eAstarNetwork.shibuya]: T;
}
export interface iAssetBase<T> {
  WETH: T;
  USDC: T;
  USDT: T;
  LAY: T;
  WBTC: T;
  WASTR: T;
  WSDN: T;
}

export interface incentivesConfig {
  starlayToken: tEthereumAddress;
  poolConfigurator: tEthereumAddress;
  addressProvider: tEthereumAddress;
  lendingPool: tEthereumAddress;
  rewardsVault: tEthereumAddress;
  incentiveControllerProxy: tEthereumAddress;
  incentiveControllerImpl: tEthereumAddress;
}

export type tEthereumAddress = string;
export type tStringTokenBigUnits = string; // 1 ETH, or 10e6 USDC or 10e18 DAI
export type tBigNumberTokenBigUnits = BigNumber;
export type tStringTokenSmallUnits = string; // 1 wei, or 1 basic unit of USDC, or 1 basic unit of DAI
export type tBigNumberTokenSmallUnits = BigNumber;
