// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.7.5;

interface IIncentivesExecutor {
  function execute(
    address[8] memory lTokenImplementations,
    address[8] memory variableDebtImplementation,
    address[8] memory reserves
  ) external;
}
