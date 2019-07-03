import chai from "chai";
const expect = chai.expect;

import { OriginFileElem } from "datastore/origin-file-elem"

describe("origin-file-elem", () => {
  it("canBeOnTheSameFileSystem", () => {
    const a_path = "/level0/level1"
    const b_path = "/level0/level1/level2"
    const c_path = "/level0/level3/level2"
    const size = 0;
    const last_modified = 0;

    const a = OriginFileElem.create(size, last_modified, a_path);
    const b = OriginFileElem.create(size, last_modified, b_path);
    const c = OriginFileElem.create(size, last_modified, c_path);

    expect(OriginFileElem.canBeOnTheSameFileSystem(a, a)).to.equal(false);
    expect(OriginFileElem.canBeOnTheSameFileSystem(a, b)).to.equal(false);
    expect(OriginFileElem.canBeOnTheSameFileSystem(a, c)).to.equal(true);

    expect(OriginFileElem.canBeOnTheSameFileSystem(b, b)).to.equal(false);
    expect(OriginFileElem.canBeOnTheSameFileSystem(b, c)).to.equal(true);

    expect(OriginFileElem.canBeOnTheSameFileSystem(c, c)).to.equal(false);
  });
});
