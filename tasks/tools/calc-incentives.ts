import { task } from 'hardhat/config';
import { parseEther } from 'ethers/lib/utils';
import { BigNumber } from 'ethers';
require('dotenv').config();

task('calc-incentives', 'Calculate incentives for next 30 days').setAction(async ({}, localBRE) => {
  const totalEmission = parseEther('23765706');
  const depositTotalEmission = totalEmission.mul(3).div(10);
  const borrowTotalEmission = totalEmission.sub(depositTotalEmission);
  const weightPerAsset = {
    ['ASTR']: 2,
    ['USDC']: 2,
    ['USDT']: 2,
    ['WETH']: 2,
    ['WBTC']: 1,
    ['WSDN']: 1,
    ['DAI']: 2,
    ['BUSD']: 2,
    ['MATIC']: 1,
    ['BNB']: 1,
    ['DOT']: 10,
  };
  const total = Object.values(weightPerAsset).reduce((p, c) => p + c, 0);
  console.log(total);
  const emissions = Object.entries(weightPerAsset).map((e) => {
    return {
      asset: e[0],
      deposit: depositTotalEmission.mul(e[1]).div(total),
      borrow: borrowTotalEmission.mul(e[1]).div(total),
    };
  });
  console.log(
    'asset, deposit emissions/m, borrow emissions/m, deposit emissions/s, borrow emissions/s'
  );
  emissions.forEach((e) =>
    console.log(
      `${e.asset},${e.deposit.toString()},${e.borrow.toString()},${e.deposit
        .div(60 * 60 * 24 * 30)
        .toString()},${e.borrow.div(60 * 60 * 24 * 30).toString()}`
    )
  );
  console.log('total');
  let totalEmissionCalculated = BigNumber.from('0');
  emissions.forEach((e) => {
    totalEmissionCalculated = totalEmissionCalculated.add(e.deposit).add(e.borrow);
  });
  console.log(totalEmissionCalculated.toString());
});
