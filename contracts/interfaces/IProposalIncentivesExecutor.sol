// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.7.5;

interface IProposalIncentivesExecutor {
  function execute(
    address[8] memory aTokenImplementations,
    address[8] memory variableDebtImplementation
  ) external;
}
