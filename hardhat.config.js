/* eslint-disable no-undef */
require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")

require("dotenv").config()

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.7",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },
  networks: {
    arctic: {
      url: `https://arctic-rpc.icenetwork.io:9933`,
      chainId: 553,
      accounts: [`0x${process.env.PRIVATE_KEY}`],
    },
    arcticArchive: {
      url: `https://arctic-archive.icenetwork.io:9934/`,
      chainId: 553,
      accounts: [`0x${process.env.PRIVATE_KEY}`],
    },
    mumbai: {
      url: `https://rpc-mumbai.maticvigil.com`,
      chainId: 80001,
      accounts: [`0x${process.env.PRIVATE_KEY}`],
    },

    coverage: {
      url: "http://localhost:8555",
    },
    localhost: {
      url: `http://127.0.0.1:8545`,
    },
  },
}
