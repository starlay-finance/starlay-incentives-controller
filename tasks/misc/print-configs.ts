import { task } from 'hardhat/config';
import { getIncentivesConfigPerNetwork, getlTokenAddressPerNetwork, getVdTokenAddressPerNetwork } from '../../helpers/constants';
import { DRE } from '../../helpers/misc-utils';
import { eNetwork, iAssetBase } from '../../helpers/types';
import { StakedTokenIncentivesController, StakedTokenIncentivesController__factory } from '../../types';

const logAssetDatas = async ({ assets, instance }: { assets: iAssetBase<string>, instance: StakedTokenIncentivesController }) => {
  await Promise.all(
    Object.keys(assets).map(async key => {
      const _assetData = await logAssetData({
        address: assets[key],
        instance: instance
      })
      console.log(`${key} ... ${assets[key]}`)
      console.log(_assetData)
    })
  )
}

const logAssetData = async ({ address, instance }: { address: string, instance: StakedTokenIncentivesController }) => {
  const _assetData = await instance.assets(address)
  return {
    emissionPerSecond: _assetData.emissionPerSecond.toString(),
    index: _assetData.index.toString(),
    lastUpdateTimestamp: _assetData.lastUpdateTimestamp,
  }
}

task('print-configs', 'print configuration about incentives').setAction(
  async ({}, localBRE) => {
    await localBRE.run('set-DRE')
    const signers = await DRE.ethers.getSigners();
    const account = signers[1] // if emissionManager, change this index of signers array
    const network = localBRE.network.name as eNetwork
    const { incentiveControllerProxy } = getIncentivesConfigPerNetwork(network)

    const incentiveControllerInstance = StakedTokenIncentivesController__factory.connect(
      incentiveControllerProxy,
      account
    )

    console.log(`--- Start Task ---`)
    const emissionManager = await incentiveControllerInstance.EMISSION_MANAGER()
    console.log(`# EmissionManager ... ${emissionManager}`)
    const distributionEnd = await incentiveControllerInstance.DISTRIBUTION_END()
    console.log(`# DistributionEnd ... ${distributionEnd.toString()}`)

    console.log(`# Check configurations`)
    console.log("## LTokens")
    await logAssetDatas({
      assets: getlTokenAddressPerNetwork(network),
      instance: incentiveControllerInstance
    })
    console.log("## VaribaleDebtTokens")
    await logAssetDatas({
      assets: getVdTokenAddressPerNetwork(network),
      instance: incentiveControllerInstance
    })

    console.log(`--- Finished Task ---`)
  }
)
