var assert = require("assert");

const Web3 = require("web3");
const util = require("ethereumjs-util");
const ProviderEngine = require("web3-provider-engine");
const FetchSubprovider = require("web3-provider-engine/subproviders/fetch.js");

const engine = new ProviderEngine();
const web3 = new Web3(engine);

engine.addProvider(
  new FetchSubprovider({
    rpcUrl: "http://localhost:8545"
  })
);
engine.start();

const {
  getAddress,
  testUnPrefixedSignature,
  testPrefixedSignature
} = require("./common");

describe("FetchSubprovider", () => {
  let address;
  before(async () => {
    address = await getAddress(web3);
  });
  it("accepts prefixed signatures", async () => {
    assert(await testPrefixedSignature(web3, address));
  });
  it("rejects un-prefixed signatures", async () => {
    assert(!await testUnPrefixedSignature(web3, address));
  });
});
