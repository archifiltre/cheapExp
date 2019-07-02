import chai from "chai";
const expect = chai.expect;

import { Quickcheck } from "test/quickcheck";
import * as Arbitrary from "test/arbitrary";
import * as M from "./color";

describe("color", function() {
  Quickcheck.loop("(fromRgba . toRgba) a", () => {
    const a = M.arbitrary();

    expect(M.fromRgba(M.toRgba(a))).to.deep.equal(a);
  });

  Quickcheck.loop("(fromHex . toHex) a", () => {
    const a = M.arbitrary();

    expect(M.fromHex(M.toHex(a))).to.deep.equal(M.setAlpha(1, a));
  });
});
