// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.7.5;
pragma abicoder v2;

import {IERC20} from '@aave/aave-stake/contracts/interfaces/IERC20.sol';
import {ILendingPoolAddressesProvider} from '../interfaces/ILendingPoolAddressesProvider.sol';
import {ILendingPoolConfigurator} from '../interfaces/ILendingPoolConfigurator.sol';
import {IIncentivesController} from '../interfaces/IIncentivesController.sol';
import {IAaveEcosystemReserveController} from '../interfaces/IAaveEcosystemReserveController.sol';
import {IProposalIncentivesExecutor} from '../interfaces/IProposalIncentivesExecutor.sol';
import {DistributionTypes} from '../lib/DistributionTypes.sol';
import {DataTypes} from '../utils/DataTypes.sol';
import {ILendingPoolData} from '../interfaces/ILendingPoolData.sol';
import {IATokenDetailed} from '../interfaces/IATokenDetailed.sol';
import {PercentageMath} from '../utils/PercentageMath.sol';
import {SafeMath} from '../lib/SafeMath.sol';

contract ProposalIncentivesExecutor is IProposalIncentivesExecutor {
  using SafeMath for uint256;
  using PercentageMath for uint256;

  address constant AAVE_TOKEN = 0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9;
  address constant POOL_CONFIGURATOR = 0x311Bb771e4F8952E6Da169b425E7e92d6Ac45756;
  address constant ADDRESSES_PROVIDER = 0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5;
  address constant LENDING_POOL = 0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9;
  address constant ECO_RESERVE_ADDRESS = 0x1E506cbb6721B83B1549fa1558332381Ffa61A93;
  address constant INCENTIVES_CONTROLLER_PROXY_ADDRESS = 0xd784927Ff2f95ba542BfC824c8a8a98F3495f6b5;
  address constant INCENTIVES_CONTROLLER_IMPL_ADDRESS = 0x83D055D382f25e6793099713505c68a5C7535a35;

  uint256 constant DISTRIBUTION_DURATION = 2592000; // 30 days
  uint256 constant DISTRIBUTION_AMOUNT = 32600420000000000000000000; // 32600420 LAY during 30 days

  function execute(
    address[8] memory aTokenImplementations,
    address[8] memory variableDebtImplementations
  ) external override {
    uint256 tokensCounter;

    address[] memory assets = new address[](16);

    // Reserves Order: DAI/GUSD/USDC/USDT/WBTC/WETH
    address payable[8] memory reserves = [
      0xDE35705D679dF73474E7926F39c3387Db15Be8A9, // ASTL at shibuya
      0xB71Bf258d5Dd9d257f8d2018ECC560f225863eF7, // USDC 18 at shibuya
      0x5C56E2a9B5e0d04eA9674984c813D40D1b960d23, // USDT 18 at shibuya
      0x04efa209F9e74E612a529c393Cf9F1141E696F06, // WETH at shibuya
      0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599, // WBTC at shibuya TODO: fix address
      0x580B50B913C602A9aE17FbcA815a70cdd8cAE713, // WSDN at shibuya
      0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2, // ARSW at shibuya TODO: fix address
      0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2 // LAY at shibuya TODO: fix address
    ];

    uint256[] memory emissions = new uint256[](16);

    emissions[0] = 808542052469135802; //lASTR
    emissions[1] = 1886598379629629629; //vdASTR
    emissions[2] = 808542052469135802; //lUSDC
    emissions[3] = 1886598379629629629; //vdUSDC
    emissions[4] = 808542052469135802; //lUSDT
    emissions[5] = 1886598379629629629; //vdUSDT
    emissions[6] = 539028163580246913; //lWETH
    emissions[7] = 1886598379629629629; //vdWETH
    emissions[8] = 539028163580246913; //lWBTC
    emissions[9] = 1886598379629629629; //vdWBTC
    emissions[10] = 269513888888888888; //lWSDN
    emissions[11] = 628866126543209876; //vdWSDN
    emissions[12] = 0; //lARSW
    emissions[13] = 0; //vdARSW
    emissions[14] = 0; //lLAY
    emissions[15] = 0; //vdLAY
    ILendingPoolConfigurator poolConfigurator = ILendingPoolConfigurator(POOL_CONFIGURATOR);
    IIncentivesController incentivesController = IIncentivesController(
      INCENTIVES_CONTROLLER_PROXY_ADDRESS
    );
    IAaveEcosystemReserveController ecosystemReserveController = IAaveEcosystemReserveController(
      ECO_RESERVE_ADDRESS
    );

    ILendingPoolAddressesProvider provider = ILendingPoolAddressesProvider(ADDRESSES_PROVIDER);

    //adding the incentives controller proxy to the addresses provider
    provider.setAddress(keccak256('INCENTIVES_CONTROLLER'), INCENTIVES_CONTROLLER_PROXY_ADDRESS);

    //updating the implementation of the incentives controller proxy
    provider.setAddressAsProxy(
      keccak256('INCENTIVES_CONTROLLER'),
      INCENTIVES_CONTROLLER_IMPL_ADDRESS
    );

    require(
      aTokenImplementations.length == variableDebtImplementations.length &&
        aTokenImplementations.length == reserves.length,
      'ARRAY_LENGTH_MISMATCH'
    );

    // Update each reserve AToken implementation, Debt implementation, and prepare incentives configuration input
    for (uint256 x = 0; x < reserves.length; x++) {
      require(
        IATokenDetailed(aTokenImplementations[x]).UNDERLYING_ASSET_ADDRESS() == reserves[x],
        'AToken underlying does not match'
      );
      require(
        IATokenDetailed(variableDebtImplementations[x]).UNDERLYING_ASSET_ADDRESS() == reserves[x],
        'Debt Token underlying does not match'
      );
      DataTypes.ReserveData memory reserveData = ILendingPoolData(LENDING_POOL).getReserveData(
        reserves[x]
      );

      // Update aToken impl
      poolConfigurator.updateAToken(reserves[x], aTokenImplementations[x]);

      // Update variable debt impl
      poolConfigurator.updateVariableDebtToken(reserves[x], variableDebtImplementations[x]);

      assets[tokensCounter++] = reserveData.aTokenAddress;

      // Configure variable debt token at incentives controller
      assets[tokensCounter++] = reserveData.variableDebtTokenAddress;
    }
    // Transfer AAVE funds to the Incentives Controller
    ecosystemReserveController.transfer(
      AAVE_TOKEN,
      INCENTIVES_CONTROLLER_PROXY_ADDRESS,
      DISTRIBUTION_AMOUNT
    );

    // Enable incentives in aTokens and Variable Debt tokens
    incentivesController.configureAssets(assets, emissions);

    // Sets the end date for the distribution
    incentivesController.setDistributionEnd(block.timestamp + DISTRIBUTION_DURATION);
  }
}
