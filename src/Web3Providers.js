const Web3 = require("web3");
const util = require("ethereumjs-util");
const ProviderEngine = require("web3-provider-engine");
const FetchSubprovider = require("web3-provider-engine/subproviders/fetch.js");
const HookedWalletProvider = require("web3-provider-engine/subproviders/hooked-wallet.js");
const WalletSubprovider = require("web3-provider-engine/subproviders/wallet.js");

const Transaction = require("ethereumjs-tx");

const bip39 = require("bip39");
const hdkey = require("ethereumjs-wallet/hdkey");

const com = require("./Com");

module.exports.getWalletProvider = async rpcUrl => {
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
      rpcUrl
    })
  );
  engine.start();
  return {
    address,
    engine,
    web3
  };
};

module.exports.getWeb3Provider = async rpcUrl => {
  const engine = new ProviderEngine();
  const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
  const address = await com.getAddress(web3);
  return {
    address,
    engine,
    web3
  };
};

module.exports.getFetchProvider = async rpcUrl => {
  const engine = new ProviderEngine();
  const web3 = new Web3(engine);
  engine.addProvider(
    new FetchSubprovider({
      rpcUrl
    })
  );
  engine.start();
  const address = await com.getAddress(web3);
  return {
    address,
    engine,
    web3
  };
};

module.exports.getHookedWalletProvider = async rpcUrl => {
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
      rpcUrl
    })
  );
  engine.start();

  return {
    address: addressHex,
    engine,
    web3
  };
};
