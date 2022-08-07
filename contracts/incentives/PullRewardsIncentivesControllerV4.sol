// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.7.5;
pragma experimental ABIEncoderV2;

import {IERC20} from '../stake-v1/contracts/interfaces/IERC20.sol';
import {SafeERC20} from '../stake-v1/contracts/lib/SafeERC20.sol';

import {ILendingPool} from '../interfaces/ILendingPool.sol';
import {IScaledBalanceToken} from '../interfaces/IScaledBalanceToken.sol';
import {IVoter} from '../interfaces/IVoter.sol';
import {DataTypes} from '../utils/DataTypes.sol';
import {DistributionTypes} from '../lib/DistributionTypes.sol';

import {BaseIncentivesControllerV3} from './base/BaseIncentivesControllerV3.sol';

/**
 * @title PullRewardsIncentivesController
 * @notice Distributor contract for ERC20 rewards to the protocol participants that pulls ERC20 from external account
 * @author Starlay
 **/
contract PullRewardsIncentivesControllerV4 is BaseIncentivesControllerV3 {
  using SafeERC20 for IERC20;

  uint256 public lastAppliedTerm;

  // [deposit, borrow]
  uint256[2] public depositBorrowWeights = [1, 1];

  mapping(uint256 => uint256) public emissionPerSecondsByTerm;

  address internal _rewardsVault;

  address internal _pool;

  address internal _voter;

  event RewardsVaultUpdated(address indexed vault);

  constructor(IERC20 rewardToken) BaseIncentivesControllerV3(rewardToken) {}

  /**
   * @dev Initialize BaseIncentivesController
   * @param rewardsVault rewards vault to pull ERC20 funds
   **/
  function initialize(
    address rewardsVault,
    address pool,
    address voter,
    address emissionManager
  ) external initializer {
    _rewardsVault = rewardsVault;
    _pool = pool;
    _voter = voter;
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

  function configureAssetsWithVoter() external {
    // get assets
    address[] memory reserves = ILendingPool(_pool).getReservesList();
    require(reserves.length > 0, 'No Reserves Found');
    address[] memory lTokens = new address[](reserves.length);
    address[] memory vdTokens = new address[](reserves.length);
    for (uint256 i = 0; i < reserves.length; i++) {
      DataTypes.ReserveData memory data = ILendingPool(_pool).getReserveData(reserves[i]);
      lTokens[i] = data.lTokenAddress;
      vdTokens[i] = data.variableDebtTokenAddress;
    }

    // get vote results
    uint256 term = IVoter(_voter).currentTermTimestamp();
    // revert if already applied
    require(term > lastAppliedTerm, 'Already Applied');
    uint256 totalWeight = IVoter(_voter).totalWeight(term);
    uint256[] memory weights = new uint256[](reserves.length);
    for (uint256 i = 0; i < lTokens.length; i++) {
      weights[i] = IVoter(_voter).poolWeights(lTokens[i], term);
    }

    // get depo/borrow weights
    uint256 depositWeight = depositBorrowWeights[0];
    uint256 borrowWeight = depositBorrowWeights[1];
    uint256 totalDepositBorrowWeight = depositWeight + borrowWeight;
    // get total emission per seconds of term
    uint256 emissionPerSecond = emissionPerSecondsByTerm[term];

    // calc each emission per second
    DistributionTypes.AssetConfigInput[]
      memory assetsConfig = new DistributionTypes.AssetConfigInput[](reserves.length * 2);
    for (uint256 i = 0; i < reserves.length; i++) {
      uint256 reserveEmissionPerSecond = totalWeight == 0
        ? 0
        : (emissionPerSecond * weights[i]) / totalWeight;
      uint256 lTokenIndex = i * 2;
      assetsConfig[lTokenIndex].underlyingAsset = lTokens[i];
      assetsConfig[lTokenIndex].emissionPerSecond = uint104(
        (reserveEmissionPerSecond * depositWeight) / totalDepositBorrowWeight
      );
      assetsConfig[lTokenIndex].totalStaked = IScaledBalanceToken(lTokens[i]).scaledTotalSupply();

      uint256 vdTokenIndex = lTokenIndex + 1;
      assetsConfig[vdTokenIndex].underlyingAsset = vdTokens[i];
      assetsConfig[vdTokenIndex].emissionPerSecond = uint104(
        (reserveEmissionPerSecond * borrowWeight) / totalDepositBorrowWeight
      );
      assetsConfig[vdTokenIndex].totalStaked = IScaledBalanceToken(vdTokens[i]).scaledTotalSupply();
    }
    _configureAssets(assetsConfig);

    // save applied term
    lastAppliedTerm = term;
  }

  function setDepositBorrowWeight(uint256 depositWeight, uint256 borrowWeight)
    external
    onlyEmissionManager
  {
    depositBorrowWeights[0] = depositWeight;
    depositBorrowWeights[1] = borrowWeight;
  }

  function setEmissionPerSeconds(uint256[] memory terms, uint256[] memory emissionPerSeconds)
    external
    onlyEmissionManager
  {
    for (uint256 i = 0; i < terms.length; i++) {
      emissionPerSecondsByTerm[terms[i]] = emissionPerSeconds[i];
    }
  }
}
