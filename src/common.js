const util = require("ethereumjs-util");

module.exports.getAddress = web3 => {
  return new Promise((resolve, reject) => {
    web3.eth.getAccounts((err, addresses) => {
      resolve(addresses[0]);
    });
  });
};

module.exports.signMessage = (web3, address, msgHex) => {
  return new Promise(async (resolve, reject) => {
    web3.eth.sign(address, msgHex, (err, signature) => {
      if (err) {
        reject(err);
      }
      resolve(signature);
    });
  });
};

module.exports.testRecover = (address, data, sig) => {
  const { v, r, s } = util.fromRpcSig(sig);
  const pubKey = util.ecrecover(data, v, r, s);
  const addrBuf = util.pubToAddress(pubKey);
  const addr = util.bufferToHex(addrBuf);
  // console.log(address, addr);
  return address === addr;
};

module.exports.testUnPrefixedSignature = async (web3, address) => {
  const msg = new Buffer("hello");
  const msgHex = "0x" + msg.toString("hex");
  const sig = await module.exports.signMessage(web3, address, msgHex);
  const messageBuffer = util.toBuffer(util.sha3(msg));
  return module.exports.testRecover(address, messageBuffer, sig);
};

module.exports.testPrefixedSignature = async (web3, address) => {
  const msg = new Buffer("hello");
  const msgHex = "0x" + msg.toString("hex");
  const sig = await module.exports.signMessage(web3, address, msgHex);
  const prefix = new Buffer("\x19Ethereum Signed Message:\n");
  const prefixedMsgBuffer = util.sha3(
    Buffer.concat([prefix, new Buffer(String(msg.length)), msg])
  );
  return module.exports.testRecover(address, prefixedMsgBuffer, sig);
};
