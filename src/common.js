const util = require("ethereumjs-util");

const getAddress = web3 => {
  return new Promise((resolve, reject) => {
    web3.eth.getAccounts((err, addresses) => {
      resolve(addresses[0].toLowerCase());
    });
  });
};

const signMessage = (web3, address, msgHex) => {
  return new Promise(async (resolve, reject) => {
    web3.eth.sign(address, msgHex, (err, signature) => {
      if (err) {
        reject(err);
      }
      resolve(signature);
    });
  });
};

const testRecover = (address, data, sig) => {
  const { v, r, s } = util.fromRpcSig(sig);
  const pubKey = util.ecrecover(data, v, r, s);
  const addrBuf = util.pubToAddress(pubKey);
  const addr = util.bufferToHex(addrBuf);
  return address === addr;
};

const testUnPrefixedSignature = async (web3, address) => {
  const msg = web3.sha3("hello!");
  const sig = await signMessage(web3, address, msg);
  const messageBuffer = util.toBuffer(msg);
  const success = testRecover(address, messageBuffer, sig);
  console.log("Un-Prefixed Works:\t", false);
};

const testPrefixedSignature = async (web3, address) => {
  const msg = new Buffer("hello");
  const msgHex = "0x" + msg.toString("hex");
  const sig = await signMessage(web3, address, msgHex);
  const prefix = new Buffer("\x19Ethereum Signed Message:\n");
  const prefixedMsgBuffer = util.sha3(
    Buffer.concat([prefix, new Buffer(String(msg.length)), msg])
  );
  const success = testRecover(address, prefixedMsgBuffer, sig);
  console.log("Prefix Works:\t\t", success);
};

module.exports = {
  getAddress,
  signMessage,
  testRecover,
  testUnPrefixedSignature,
  testPrefixedSignature
};
