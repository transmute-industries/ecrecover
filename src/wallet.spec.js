var assert = require("assert");

const Web3 = require("web3");
const util = require("ethereumjs-util");
const ProviderEngine = require("web3-provider-engine");
const bip39 = require("bip39");
const hdkey = require("ethereumjs-wallet/hdkey");

const WalletSubprovider = require("web3-provider-engine/subproviders/wallet.js");
const FetchSubprovider = require("web3-provider-engine/subproviders/fetch.js");

const engine = new ProviderEngine();
const web3 = new Web3(engine);
const mnemonic = bip39.generateMnemonic();
const hdwallet = hdkey.fromMasterSeed(bip39.mnemonicToSeed(mnemonic));
const walletHDPath = "m/44'/60'/0'/0/";
const wallet = hdwallet.derivePath(walletHDPath + "0").getWallet();
const address = "0x" + wallet.getAddress().toString("hex");

engine.addProvider(new WalletSubprovider(wallet, {}));
engine.addProvider(
  new FetchSubprovider({
    rpcUrl: "http://localhost:8545"
  })
);
engine.start();

const com = require("./common");

describe("WalletSubprovider", () => {
  it("rejects prefixed signatures", async () => {
    assert(!await com.testSignatureRecovery(web3, address, true));
  });
  it("accepts un-prefixed signatures", async () => {
    assert(await com.testSignatureRecovery(web3, address, false));
  });

  it("getSignatureType return NO-PREFIX", async () => {
    assert("NO-PREFIX" === (await com.getSignatureType(web3, address)));
  });
});
