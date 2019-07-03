import chai from "chai";
const expect = chai.expect;

import { Quickcheck } from "test/quickcheck";
import * as Arbitrary from "test/arbitrary";
import * as M from "cache";

describe("cache", () => {
  Quickcheck.loop("basic test to improve", function() {
    let a = 0;
    const f = b => {
      a++;
      return b + 1;
    };
    const cacheF = M.make(f);


    expect(a).to.equal(0);
    expect(cacheF(1)).to.equal(2);
    expect(a).to.equal(1);
    expect(cacheF(1)).to.equal(2);
    expect(a).to.equal(1);
    expect(cacheF(2)).to.equal(3);
    expect(a).to.equal(2);
    expect(cacheF(1)).to.equal(2);
    expect(a).to.equal(3);
  });
});
