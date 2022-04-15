// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.7.5;
pragma experimental ABIEncoderV2;

import {SafeERC20} from '../stake-v1/contracts/lib/SafeERC20.sol';
import {IERC20} from '../stake-v1/contracts/interfaces/IERC20.sol';
import {BaseIncentivesController} from './base/BaseIncentivesController.sol';
import {IStakedTokenWithConfig} from '../interfaces/IStakedTokenWithConfig.sol';

/**
 * @title StakedTokenIncentivesController
 * @notice Distributor contract for rewards to the protocol, using a staked token as rewards asset.
 * The contract stakes the rewards before redistributing them to the protocol participants.
 * The reference staked token implementation is at https://github.com/starlay-finance/starlay-stake
 * @author Starlay
 **/
contract StakedTokenIncentivesController is BaseIncentivesController {
  using SafeERC20 for IERC20;

  IStakedTokenWithConfig public immutable STAKE_TOKEN;

  constructor(IStakedTokenWithConfig stakeToken)
    BaseIncentivesController(IERC20(address(stakeToken)))
  {
    STAKE_TOKEN = stakeToken;
  }

  /**
   * @dev Initialize IStakedTokenIncentivesController
   **/
  function initialize(address emissionManager) external initializer {
    require(emissionManager != address(0), "INVALID_EMISSION_MANAGER");
    //approves the safety module to allow staking
    IERC20(STAKE_TOKEN.STAKED_TOKEN()).safeApprove(address(STAKE_TOKEN), type(uint256).max);
    _emissionManager = emissionManager;
  }

  /// @inheritdoc BaseIncentivesController
  function _transferRewards(address to, uint256 amount) internal override {
    STAKE_TOKEN.stake(to, amount);
  }
}
