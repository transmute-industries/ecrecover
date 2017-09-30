const Web3 = require("web3");
const util = require("ethereumjs-util");
const ProviderEngine = require("web3-provider-engine");
const WalletSubprovider = require("web3-provider-engine/subproviders/wallet.js");
const Web3Subprovider = require("web3-provider-engine/subproviders/web3.js");

const engine = new ProviderEngine();
engine.addProvider(
  new Web3Subprovider(new Web3.providers.HttpProvider("http://localhost:8545"))
);
engine.start();
// const web3 = new Web3(engine);

const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

const getAddress = () => {
  return new Promise((resolve, reject) => {
    web3.eth.getAccounts((err, addresses) => {
      resolve(addresses[0].toLowerCase());
    });
  });
};

const signMessage = (address, msgHex) => {
  return new Promise(async (resolve, reject) => {
    web3.eth.sign(address, msgHex, (err, signature) => {
      if (err) {
        reject(err);
      }
      resolve(signature);
    });
  });
};

const testSignature = async address => {
  const msg = web3.sha3("hello!");
  const sig = await signMessage(address, msg);
  const { v, r, s } = util.fromRpcSig(sig);
  const pubKey = util.ecrecover(util.toBuffer(msg), v, r, s);
  const addrBuf = util.pubToAddress(pubKey);
  const addr = util.bufferToHex(addrBuf);
  //   console.log(address, addr);
  return address === addr;
};

const testPrefixedSignature = async address => {
  const msg = new Buffer("hello");
  const msgHex = "0x" + msg.toString("hex");
  const sig = await signMessage(address, msgHex);
  const res = util.fromRpcSig(sig);
  const prefix = new Buffer("\x19Ethereum Signed Message:\n");
  const prefixedMsg = util.sha3(
    Buffer.concat([prefix, new Buffer(String(msg.length)), msg])
  );

  const pubKey = util.ecrecover(prefixedMsg, res.v, res.r, res.s);
  const addrBuf = util.pubToAddress(pubKey);
  const addr = util.bufferToHex(addrBuf);
  //   console.log(address, addr);
  return address === addr;
};

new Promise(async (resolve, reject) => {
  let address = await getAddress();
  let unprefixed = await testSignature(address);
  let prefixed = await testPrefixedSignature(address);

  console.log(
    unprefixed
      ? "Signature does not require a prefix"
      : "Signature requires a prefix"
  );

  console.log(
    prefixed
      ? "Signature requires a prefix"
      : "Signature does not require a prefix"
  );
  resolve(true);
});
