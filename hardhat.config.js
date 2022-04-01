require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require('hardhat-abi-exporter');
require("@nomiclabs/hardhat-etherscan");
require('dotenv').config()
require('solidity-coverage')

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

module.exports = {
  solidity: "0.8.0",
  gasReporter: {
    enabled: (process.env.REPORT_GAS) ? true : false,
    currency: 'USD',
    token: "ETH",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY || null,
    gasPriceApi: "https://api.etherscan.io/api?module=proxy&action=eth_gasPrice",
    rst: true,
    rstTitle: "Gas Usage",
    showTimeSpent: true,
    showMethodSig: true
  },
  networks: {
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${process.env.GOERLI_ALCHEMY_API_KEY}`,
      accounts: [`${process.env.GOERLI_PRIVATE_KEY}`],
    },
    ropsten: {
      url: `https://eth-ropsten.alchemyapi.io/v2/${process.env.ROPSTEN_ALCHEMY_API_KEY}`,
      accounts: [`${process.env.ROPSTEN_PRIVATE_KEY}`],
    },
    rinkeby: {
      url: `https://eth-goerli.alchemyapi.io/v2/${process.env.RINKEBY_ALCHEMY_API_KEY}`,
      accounts: [`${process.env.RINKEBY_PRIVATE_KEY}`],
    },
  },
  abiExporter: {
    path: './data/abi',
    runOnCompile: true,
    clear: true,
    flat: true,
    only: ['Agreement'],
    spacing: 2,
    pretty: true,
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};
