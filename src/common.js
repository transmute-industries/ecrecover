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

module.exports.prepareStringForSigning = value => {
  const msg = new Buffer(value);
  const msgHex = "0x" + msg.toString("hex");
  return {
    msg,
    msgHex
  };
};

module.exports.getSha3BufferOfPrefixedMessage = msg => {
  const prefix = new Buffer("\x19Ethereum Signed Message:\n");
  const prefixedMsgBuffer = util.sha3(
    Buffer.concat([prefix, new Buffer(String(msg.length)), msg])
  );
  return prefixedMsgBuffer;
};

module.exports.getSha3BufferOfMessage = msg => {
  return util.toBuffer(util.sha3(msg));
};

module.exports.testSignatureRecovery = async (web3, address, isPrefixed) => {
  const msgObj = module.exports.prepareStringForSigning("hello!");
  const sig = await module.exports.signMessage(web3, address, msgObj.msgHex);
  let messageBuffer;
  if (isPrefixed) {
    messageBuffer = module.exports.getSha3BufferOfPrefixedMessage(msgObj.msg);
  } else {
    messageBuffer = module.exports.getSha3BufferOfMessage(msgObj.msg);
  }
  return module.exports.testRecover(address, messageBuffer, sig);
};

module.exports.getSignatureType = async (web3, address) => {
  const prefix = await module.exports.testSignatureRecovery(
    web3,
    address,
    true
  );
  const unprefixed = await module.exports.testSignatureRecovery(
    web3,
    address,
    false
  );
  if (prefix && !unprefixed) {
    return "PREFIX";
  }
  if (!prefix && unprefixed) {
    return "NO-PREFIX";
  }
};
