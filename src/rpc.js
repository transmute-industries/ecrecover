const Web3 = require("web3");
const util = require("ethereumjs-util");
const ProviderEngine = require("web3-provider-engine");
const FetchSubprovider = require("web3-provider-engine/subproviders/fetch.js");

const engine = new ProviderEngine();
engine.addProvider(
  new FetchSubprovider({
    rpcUrl: "http://localhost:8545"
  })
);
engine.start();
const web3 = new Web3(engine);

const {
  getAddress,
  signMessage,
  testRecover,
  testUnPrefixedSignature,
  testPrefixedSignature,
  testAll
} = require("./common");

new Promise(async (resolve, reject) => {
  const address = await getAddress(web3);
  await testAll(web3, address);
  resolve(true);
});
