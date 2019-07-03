import chai from "chai";
const expect = chai.expect;
import { Quickcheck } from "test/quickcheck";
import { Tag } from "datastore/tag"

describe("tag", () => {
  Quickcheck.loop("fromJs . toJs == identity", () => {
    const a = Tag.arbitrary();
    expect(
      Tag.fromJs(Tag.toJs(a)).toJS()
    ).to.deep.equal(
      a.toJS()
    );
  });
});
