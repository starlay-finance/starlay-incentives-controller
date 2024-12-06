// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.7.5;
pragma experimental ABIEncoderV2;

import {ILendingPoolAddressesProvider} from '../interfaces/ILendingPoolAddressesProvider.sol';
import {ILendingPool} from '../interfaces/ILendingPool.sol';
import {DataTypes} from '../utils/DataTypes.sol';

contract LendingPoolMock is ILendingPool {

  address[] reserves;
  mapping(address => DataTypes.ReserveData) reserveData;

  function deposit(
    address asset,
    uint256 amount,
    address onBehalfOf,
    uint16 referralCode
  ) external override {
    revert("mock not implemented");
  }

  function withdraw(
    address asset,
    uint256 amount,
    address to
  ) external override returns (uint256) {
    revert("mock not implemented");
    return 0;
  }

  function borrow(
    address asset,
    uint256 amount,
    uint256 interestRateMode,
    uint16 referralCode,
    address onBehalfOf
  ) external override {
    revert("mock not implemented");
  }
  
  function repay(
    address asset,
    uint256 amount,
    uint256 rateMode,
    address onBehalfOf
  ) external override returns (uint256) {
    revert("mock not implemented");
    return 0;
  }

  function swapBorrowRateMode(address asset, uint256 rateMode) external override {
    revert("mock not implemented");
  }

  function rebalanceStableBorrowRate(address asset, address user) external override {
    revert("mock not implemented");
  }

  function setUserUseReserveAsCollateral(address asset, bool useAsCollateral) external override {
    revert("mock not implemented");
  }

  function liquidationCall(
    address collateralAsset,
    address debtAsset,
    address user,
    uint256 debtToCover,
    bool receiveLToken
  ) external override {
    revert("mock not implemented");
  }

  function flashLoan(
    address receiverAddress,
    address[] calldata assets,
    uint256[] calldata amounts,
    uint256[] calldata modes,
    address onBehalfOf,
    bytes calldata params,
    uint16 referralCode
  ) external override {
    revert("mock not implemented");
  }

  function getUserAccountData(address user)
    external override
    view
    returns (
      uint256 totalCollateralETH,
      uint256 totalDebtETH,
      uint256 availableBorrowsETH,
      uint256 currentLiquidationThreshold,
      uint256 ltv,
      uint256 healthFactor
    ) {
    revert("mock not implemented");
  }

  function initReserve(
    address reserve,
    address lTokenAddress,
    address stableDebtAddress,
    address variableDebtAddress,
    address interestRateStrategyAddress
  ) external override {
    revert("mock not implemented");
  }

  function setReserveInterestRateStrategyAddress(address reserve, address rateStrategyAddress)
    external override {
    revert("mock not implemented");
  }

  function setConfiguration(address reserve, uint256 configuration) external override {
    revert("mock not implemented");
  }

  function getConfiguration(address asset)
    external override
    view
    returns (DataTypes.ReserveConfigurationMap memory) {
    revert("mock not implemented");
  }

  function getUserConfiguration(address user)
    external override
    view
    returns (DataTypes.UserConfigurationMap memory) {
    revert("mock not implemented");
  }

  function getReserveNormalizedIncome(address asset) external override view returns (uint256) {
    revert("mock not implemented");
  }

  function getReserveNormalizedVariableDebt(address asset) external override view returns (uint256) {
    revert("mock not implemented");
  }

  function getReserveData(address asset) external override view returns (DataTypes.ReserveData memory) {
    return reserveData[asset];
  }

  function finalizeTransfer(
    address asset,
    address from,
    address to,
    uint256 amount,
    uint256 balanceFromAfter,
    uint256 balanceToBefore
  ) external override {
    revert("mock not implemented");
  }

  function getReservesList() external override view returns (address[] memory) {
    return reserves;
  }

  function getAddressesProvider() external override view returns (ILendingPoolAddressesProvider) {
    revert("mock not implemented");
  }

  function setPause(bool val) external override {
    revert("mock not implemented");
  }

  function paused() external override view returns (bool) {
    revert("mock not implemented");
  }

  function setReservesList(address[] memory _reserves) external {
    reserves = _reserves;
  }
  function setReserveData(address reserve, DataTypes.ReserveData memory data) external {
    reserveData[reserve] = data;
  }
}
