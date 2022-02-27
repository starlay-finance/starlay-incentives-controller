[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Build pass](https://github.com/starley-finance/starley-incentives-controller/actions/workflows/node.js.yml/badge.svg)](https://github.com/starley-finance/starley-incentives-controller/actions/workflows/node.js.yml)
[![codecov](https://codecov.io/gh/starley-finance/starley-incentives-controller/branch/master/graph/badge.svg?token=DRFNLw506C)](https://codecov.io/gh/starley-finance/starley-incentives-controller)

# Starley incentives

## Introduction

This repo contains the code and implementation of the contracts used to activate the liquidity mining program on the main market of the Starley protocol.

## About Development

### Setup

set specified node version
reference: `.node-version`

create `.env` file like

```bash
# Mnemonic, only first address will be used
MNEMONIC=""

# Add Alchemy or Infura provider keys, alchemy takes preference at the config level
ALCHEMY_KEY=""
INFURA_KEY=""
BWARE_LABS_KEY=""

# Optional Etherscan key, for automatize the verification of the contracts at Etherscan
ETHERSCAN_KEY=""

# Optional, if you plan to use Tenderly scripts
TENDERLY_PROJECT=""
TENDERLY_USERNAME=""

# defender Relay
DEFENDER_API_KEY=""
DEFENDER_SECRET_KEY=""
```

### Deploy

```bash
npm install
npm run compile
docker-compose up
# --- other terminal ---
docker-compose exec contracts-env bash
npm run deploy:incentives-controller-impl:shiden
```

#### Set configurations

```bash
# Update configurations
# [Prerequisite] update token addresses in helpers/constants.ts & emission manager address
docker-compose exec contracts-env bash
npm run update:incentives:shiden
# Check configurations
npm run print-configs:shiden
```
