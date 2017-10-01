const util = require("ethereumjs-util");
const _ = require("lodash");

module.exports.getAddress = web3 => {
  return new Promise((resolve, reject) => {
    web3.eth.getAccounts((err, addresses) => {
      resolve(addresses[0]);
    });
  });
};

module.exports.signMessage = (web3, address, msgHex) => {
  let sigPromise = new Promise((resolve, reject) => {
    web3.eth.sign(address, msgHex, (err, signature) => {
      if (err) {
        resolve(null);
      } else {
        resolve(signature);
      }
    });
  });
  return sigPromise
    .then(signature => {
      return signature;
    })
    .catch(err => {
      return null;
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

module.exports.getMessageSignatureWithMeta = async (web3, address, message) => {
  const msgObj = module.exports.prepareStringForSigning(message);

  const sig = await module.exports.signMessage(web3, address, msgObj.msgHex);

  if (sig === null) {
    throw "Cannot sign message with address. Consider if this address is a node or wallet address, and how web3 provider engine has been initialized.";
  }

  const prefixedMessageBuffer = module.exports.getSha3BufferOfPrefixedMessage(
    msgObj.msg
  );
  const messageBuffer = module.exports.getSha3BufferOfMessage(msgObj.msg);

  let isPrefixed;

  if (module.exports.testRecover(address, prefixedMessageBuffer, sig)) {
    isPrefixed = true;
  }

  if (module.exports.testRecover(address, messageBuffer, sig)) {
    isPrefixed = false;
  }

  return {
    messageBuffer: isPrefixed ? prefixedMessageBuffer : messageBuffer,
    messageHex: msgObj.msgHex,
    signature: sig,
    address,
    isPrefixed
  };
};
