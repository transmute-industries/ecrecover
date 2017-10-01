var assert = require("assert");
const Transaction = require("ethereumjs-tx");
const Web3 = require("web3");
const util = require("ethereumjs-util");
const ProviderEngine = require("web3-provider-engine");

const HookedWalletProvider = require("web3-provider-engine/subproviders/hooked-wallet.js");
const FetchSubprovider = require("web3-provider-engine/subproviders/fetch.js");

const engine = new ProviderEngine();
const web3 = new Web3(engine);

const privateKey = new Buffer(
  "cccd8f4d88de61f92f3747e4a9604a0395e6ad5138add4bec4a2ddf231ee24f9",
  "hex"
);
const address = new Buffer("1234362ef32bcd26d3dd18ca749378213625ba0b", "hex");
const addressHex = "0x" + address.toString("hex");

function concatSig(v, r, s) {
  r = util.fromSigned(r);
  s = util.fromSigned(s);
  v = util.bufferToInt(v);
  r = util.toUnsigned(r).toString("hex");
  s = util.toUnsigned(s).toString("hex");
  v = util.stripHexPrefix(util.intToHex(v));
  return util.addHexPrefix(r.concat(s, v).toString("hex"));
}

engine.addProvider(
  new HookedWalletProvider({
    getAccounts: function(cb) {
      cb(null, [addressHex]);
    },
    signTransaction: function(txParams, cb) {
      var tx = new Transaction(txParams);
      tx.sign(privateKey);
      var rawTx = "0x" + tx.serialize().toString("hex");
      cb(null, rawTx);
    },
    signMessage: function(msgParams, cb) {
      var msgHash = util.sha3(msgParams.data);
      var sig = util.ecsign(msgHash, privateKey);
      var serialized = util.bufferToHex(concatSig(sig.v, sig.r, sig.s));
      cb(null, serialized);
    }
  })
);
engine.addProvider(
  new FetchSubprovider({
    rpcUrl: "http://localhost:8545"
  })
);
engine.start();

const com = require("./common");

describe("HookedWalletProvider", () => {
  it("rejects prefixed signatures", async () => {
    assert(!await com.testPrefixedSignature(web3, addressHex));
  });
  it("accepts un-prefixed signatures", async () => {
    assert(await com.testUnPrefixedSignature(web3, addressHex));
  });
});
