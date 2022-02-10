// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.7.5;

interface ILendingPoolConfigurator {
  function updateLToken(address reserve, address implementation) external;

  function updateVariableDebtToken(address reserve, address implementation) external;
}
