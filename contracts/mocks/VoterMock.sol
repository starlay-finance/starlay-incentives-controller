// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.7.5;
pragma experimental ABIEncoderV2;

import {IVoter} from '../interfaces/IVoter.sol';

contract VoterMock is IVoter {
  
  uint256 _totalWeight;
  mapping (address => mapping(uint256 => uint256)) _poolWeights;
  uint256 _currentTermTimestamp;

  function totalWeight(uint256 term) external view override returns(uint256) {
    return _totalWeight;
  }

  function poolWeights(address pool, uint256 term) external view override returns(uint256) {
    return _poolWeights[pool][term];
  }

  function currentTermTimestamp() external view override returns (uint256) {
    return _currentTermTimestamp;
  }

  function setTotalWeight(uint256 __totalWeight) external {
    _totalWeight = __totalWeight;
  }

  function setPoolWeight(address pool, uint256 term, uint256 weight) external {
    _poolWeights[pool][term] = weight;
  }

  function setCurrentTermTimestamp(uint256 __currentTermTimestamp) external {
    _currentTermTimestamp = __currentTermTimestamp;
  }
}
