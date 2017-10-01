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

const testRaw = async (web3, address) => {
  var privkey = new Buffer(
    "3c9229289a6125f7fdf1885a77bb12c37a8d3b4962d936f7e3084dece32a3ca1",
    "hex"
  );
  var data = util.sha3("a");
  var vrs = util.ecsign(data, privkey);
  var pubkey = util.ecrecover(data, vrs.v, vrs.r, vrs.s);
  // recovered public key matches private key used to sign
  var check1 =
    pubkey.toString("hex") == util.privateToPublic(privkey).toString("hex");
  var check2 =
    util.publicToAddress(pubkey).toString("hex") ==
    util.privateToAddress(privkey).toString("hex");
  // recovered address matches private address used to sign
  console.log("testRaw:\t\t\t", check1 && check2);
};

const testUnPrefixedSignature = async (web3, address) => {
  const msg = web3.sha3("hello!");
  const sig = await signMessage(web3, address, msg);
  const messageBuffer = util.toBuffer(msg);
  const success = testRecover(address, messageBuffer, sig);
  console.log("testUnPrefixedSignature:\t", false);
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
  console.log("testPrefixedSignature:\t\t", success);
};

const testAll = async (web3, address) => {
  await testRaw(web3, address);
  await testUnPrefixedSignature(web3, address);
  await testPrefixedSignature(web3, address);
};

module.exports = {
  getAddress,
  signMessage,
  testRecover,
  testUnPrefixedSignature,
  testPrefixedSignature,
  testAll
};
