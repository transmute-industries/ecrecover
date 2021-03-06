const assert = require("assert");
const Web3 = require("web3");
const util = require("ethereumjs-util");

const com = require("./Com");

describe("Utils", function() {
  it("util.ecsign + util.ecrecover work as expected", () => {
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
    assert(check1 && check2);
  });
});
