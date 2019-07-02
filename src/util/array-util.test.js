import chai from "chai";
const expect = chai.expect;

import { Quickcheck } from "test/quickcheck";
import * as Arbitrary from "test/arbitrary";
import * as M from "util/array-util";

describe("array-util", function() {
  Quickcheck.loop("(unzip . zip) a", () => {
    const index = () => 1 + Arbitrary.index();
    const i = index();
    const a = () => Arbitrary.arrayWithIndex(() => i)(Arbitrary.natural);
    const b = Arbitrary.arrayWithIndex(index)(a);

    expect(M.unzip(M.zip(b))).to.deep.equal(b);
  });

  it("join", () => {
    const a = [[1, 2, 3], [3, 5], [9]];
    M.join(a).should.deep.equal([1, 2, 3, 3, 5, 9]);
  });
});
