var assert = require("assert");
const _ = require("lodash");
const util = require("ethereumjs-util");
const com = require("./Com");
const Web3Providers = require("./Web3Providers");

const walletProviders = {
  wallet: Web3Providers.getWalletProvider,
  hooked: Web3Providers.getHookedWalletProvider
};

const nodeProviders = {
  normal: Web3Providers.getWeb3Provider,
  fetch: Web3Providers.getFetchProvider
};

const RpcUrls = {
  localhost: "http://localhost:8545",
  infura: "https://ropsten.infura.io"
};
const providers = _.concat(nodeProviders, walletProviders);

const validSignatureAssertions = (k, address, result) => {
  switch (k) {
    case "normal":
      assert(result.isPrefixed);
      break;
    case "fetch":
      assert(result.isPrefixed);
      break;
    case "wallet":
      assert(!result.isPrefixed);
      break;
    case "hooked":
      assert(!result.isPrefixed);
      break;
  }
  const { v, r, s } = util.fromRpcSig(result.signature);
  const pubKey = util.ecrecover(result.messageBuffer, v, r, s);
  const addrBuf = util.pubToAddress(pubKey);
  const addr = util.bufferToHex(addrBuf);
  assert(address === addr);
};

const testSignature = async (k, web3, address) => {
  let result = await com.getMessageSignatureWithMeta(web3, address, "hello");
  validSignatureAssertions(k, address, result);
};

const testProviders = (providers, rpcUrl) => {
  _.each(providers, (v, k) => {
    it(k + " returns a recoverable signature", async () => {
      let { web3, address } = await v(rpcUrl);
      await testSignature(k, web3, address);
    });
  });
};

describe("ECRecover https://localhost:8545", () => {
  testProviders(nodeProviders, RpcUrls.localhost);
  testProviders(walletProviders, RpcUrls.localhost);
});

describe("ECRecover https://ropsten.infura.io", () => {
  testProviders(walletProviders, RpcUrls.infura);

  _.each(nodeProviders, (v, k) => {
    it(k + " throws Cannot sign message with address.", async () => {
      let { web3, address } = await nodeProviders[k](RpcUrls.infura);
      try {
        await testSignature(k, web3, address);
      } catch (e) {
        assert(
          e ===
            "Cannot sign message with address. Consider if this address is a node or wallet address, and how web3 provider engine has been initialized."
        );
      }
    });
  });
});
