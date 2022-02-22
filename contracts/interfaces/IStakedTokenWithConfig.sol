// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.7.5;

import {IStakedToken} from '../stake-v1/contracts/interfaces/IStakedToken.sol';

interface IStakedTokenWithConfig is IStakedToken {
  function STAKED_TOKEN() external view returns(address);
}