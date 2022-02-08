// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.7.5;
pragma experimental ABIEncoderV2;

import {IERC20} from "../../submodule-stake/contracts/interfaces/IERC20.sol";
import {StakedLayV2} from "../../submodule-stake/contracts/stake/StakedLayV2.sol";

contract StakedAaveV3 is StakedLayV2 {
  constructor(
    IERC20 stakedToken,
    IERC20 rewardToken,
    uint256 cooldownSeconds,
    uint256 unstakeWindow,
    address rewardsVault,
    address emissionManager,
    uint128 distributionDuration,
    address governance
  )
    StakedLayV2(
      stakedToken,
      rewardToken,
      cooldownSeconds,
      unstakeWindow,
      rewardsVault,
      emissionManager,
      distributionDuration,
      governance
    )
  {}
}