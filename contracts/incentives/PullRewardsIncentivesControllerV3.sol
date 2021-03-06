// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.7.5;
pragma experimental ABIEncoderV2;

import {IERC20} from '../stake-v1/contracts/interfaces/IERC20.sol';
import {SafeERC20} from '../stake-v1/contracts/lib/SafeERC20.sol';

import {BaseIncentivesControllerV3} from './base/BaseIncentivesControllerV3.sol';

/**
 * @title PullRewardsIncentivesController
 * @notice Distributor contract for ERC20 rewards to the protocol participants that pulls ERC20 from external account
 * @author Starlay
 **/
contract PullRewardsIncentivesControllerV3 is
  BaseIncentivesControllerV3
{
  using SafeERC20 for IERC20;

  address internal _rewardsVault;

  event RewardsVaultUpdated(address indexed vault);
  
  constructor(IERC20 rewardToken)
    BaseIncentivesControllerV3(rewardToken)
  {}

  /**
   * @dev Initialize BaseIncentivesController
   * @param rewardsVault rewards vault to pull ERC20 funds
   **/
  function initialize(address rewardsVault, address emissionManager) external initializer {
    _rewardsVault = rewardsVault;
    _emissionManager = emissionManager;
    emit RewardsVaultUpdated(_rewardsVault);
  }

  /**
   * @dev returns the current rewards vault contract
   * @return address
   */
  function getRewardsVault() external view returns (address) {
    return _rewardsVault;
  }

  /**
   * @dev update the rewards vault address, only allowed by the Rewards admin
   * @param rewardsVault The address of the rewards vault
   **/
  function setRewardsVault(address rewardsVault) external onlyEmissionManager {
    _rewardsVault = rewardsVault;
    emit RewardsVaultUpdated(rewardsVault);
  }

 
  /// @inheritdoc BaseIncentivesControllerV3
  function _transferRewards(address to, uint256 amount) internal override {
    IERC20(REWARD_TOKEN).safeTransferFrom(_rewardsVault, to, amount);
  }

  /**
   * @dev migrate LAY token to new vault
   **/
  function migrate() external onlyEmissionManager {
    IERC20(REWARD_TOKEN).transfer(_rewardsVault, IERC20(REWARD_TOKEN).balanceOf(address(this)));
  }
}