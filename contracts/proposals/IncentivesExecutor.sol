// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.7.5;
pragma abicoder v2;

import {IERC20} from '../stake-v1/contracts/interfaces/IERC20.sol';
import {ILendingPoolAddressesProvider} from '../interfaces/ILendingPoolAddressesProvider.sol';
import {ILendingPoolConfigurator} from '../interfaces/ILendingPoolConfigurator.sol';
import {IIncentivesController} from '../interfaces/IIncentivesController.sol';
import {IStarlayEcosystemReserveController} from '../interfaces/IStarlayEcosystemReserveController.sol';
import {IIncentivesExecutor} from '../interfaces/IIncentivesExecutor.sol';
import {DistributionTypes} from '../lib/DistributionTypes.sol';
import {DataTypes} from '../utils/DataTypes.sol';
import {ILendingPoolData} from '../interfaces/ILendingPoolData.sol';
import {ILTokenDetailed} from '../interfaces/ILTokenDetailed.sol';
import {PercentageMath} from '../utils/PercentageMath.sol';
import {SafeMath} from '../lib/SafeMath.sol';

contract IncentivesExecutor is IIncentivesExecutor {
  using SafeMath for uint256;
  using PercentageMath for uint256;

  address public immutable STARLAY_TOKEN;
  address public immutable POOL_CONFIGURATOR;
  address public immutable ADDRESSES_PROVIDER;
  address public immutable LENDING_POOL;
  address public immutable ECO_RESERVE_ADDRESS;
  address public immutable INCENTIVES_CONTROLLER_PROXY_ADDRESS;
  address public immutable INCENTIVES_CONTROLLER_IMPL_ADDRESS;

  uint256 constant DISTRIBUTION_DURATION = 2592000; // 30 days
  uint256 constant DISTRIBUTION_AMOUNT = 32600420000000000000000000; // 32600420 LAY during 30 days
    
  constructor(address starlayToken,
  address poolConfigurator,
  address addressProvider,
  address lendingPool,
  address ecoReserve,
  address incentiveControllerProxy,
  address incentiveControllerImpl)
  {
    STARLAY_TOKEN = starlayToken;
    POOL_CONFIGURATOR = poolConfigurator;
    ADDRESSES_PROVIDER = addressProvider;
    LENDING_POOL = lendingPool;
    ECO_RESERVE_ADDRESS = ecoReserve;
    INCENTIVES_CONTROLLER_PROXY_ADDRESS = incentiveControllerProxy;
    INCENTIVES_CONTROLLER_IMPL_ADDRESS = incentiveControllerImpl;
  }

  function execute(
    address[8] memory lTokenImplementations,
    address[8] memory variableDebtImplementations,
    address[8] memory reserves
  ) external override {
    uint256 tokensCounter;

    address[] memory assets = new address[](16);

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
    IIncentivesController incentivesController =
      IIncentivesController(INCENTIVES_CONTROLLER_PROXY_ADDRESS);
    IStarlayEcosystemReserveController ecosystemReserveController =
      IStarlayEcosystemReserveController(ECO_RESERVE_ADDRESS);

    ILendingPoolAddressesProvider provider = ILendingPoolAddressesProvider(ADDRESSES_PROVIDER);

    //adding the incentives controller proxy to the addresses provider
    provider.setAddress(keccak256('INCENTIVES_CONTROLLER'), INCENTIVES_CONTROLLER_PROXY_ADDRESS);

    //updating the implementation of the incentives controller proxy
    provider.setAddressAsProxy(
      keccak256('INCENTIVES_CONTROLLER'),
      INCENTIVES_CONTROLLER_IMPL_ADDRESS
    );

    require(
      lTokenImplementations.length == variableDebtImplementations.length &&
        lTokenImplementations.length == reserves.length,
      'ARRAY_LENGTH_MISMATCH'
    );

    // Update each reserve LToken implementation, Debt implementation, and prepare incentives configuration input
    for (uint256 x = 0; x < reserves.length; x++) {
      require(
        ILTokenDetailed(lTokenImplementations[x]).UNDERLYING_ASSET_ADDRESS() == reserves[x],
        'LToken underlying does not match'
      );
      require(
        ILTokenDetailed(variableDebtImplementations[x]).UNDERLYING_ASSET_ADDRESS() == reserves[x],
        'Debt Token underlying does not match'
      );
      DataTypes.ReserveData memory reserveData = ILendingPoolData(LENDING_POOL).getReserveData(
        reserves[x]
      );

      // Update lToken impl
      poolConfigurator.updateLToken(reserves[x], lTokenImplementations[x]);

      // Update variable debt impl
      poolConfigurator.updateVariableDebtToken(reserves[x], variableDebtImplementations[x]);

      assets[tokensCounter++] = reserveData.lTokenAddress;

      // Configure variable debt token at incentives controller
      assets[tokensCounter++] = reserveData.variableDebtTokenAddress;
    }
    // Transfer Starlay funds to the Incentives Controller
    ecosystemReserveController.transfer(
      STARLAY_TOKEN,
      INCENTIVES_CONTROLLER_PROXY_ADDRESS,
      DISTRIBUTION_AMOUNT
    );

    // Enable incentives in lTokens and Variable Debt tokens
    incentivesController.configureAssets(assets, emissions);

    // Sets the end date for the distribution
    incentivesController.setDistributionEnd(block.timestamp + DISTRIBUTION_DURATION);
  }
}
