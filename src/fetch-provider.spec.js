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

const com = require("./common");

describe("FetchSubprovider", () => {
  let address;
  const IS_PREFIXED = true;
  before(async () => {
    address = await com.getAddress(web3);
  });
  it("accepts prefixed signatures", async () => {
    assert(await com.testSignatureRecovery(web3, address, IS_PREFIXED));
  });
  it("rejects un-prefixed signatures", async () => {
    assert(!await com.testSignatureRecovery(web3, address, !IS_PREFIXED));
  });

  it("getSignatureType return PREFIX", async () => {
    assert("PREFIX" === (await com.getSignatureType(web3, address)));
  });
});
