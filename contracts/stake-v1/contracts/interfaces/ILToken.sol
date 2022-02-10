pragma solidity ^0.7.5;

interface ILToken {
  function getScaledUserBalanceAndSupply(address user) external view returns (uint256, uint256);
}
