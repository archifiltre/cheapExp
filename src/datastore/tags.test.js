import chai from "chai";
const expect = chai.expect;

import { Quickcheck } from "test/quickcheck";
import { FilesAndFolders } from "datastore/files-and-folders";
import { Tags } from "datastore/tags";
import { Tag } from "datastore/tag";
import { Origin } from "datastore/origin";

import { Set } from "immutable";

describe("tags", function() {
  it("simple derived data test", () => {
    const ffs = FilesAndFolders.computeDerived(
      FilesAndFolders.fromOrigin(Origin.fromJs([
        [{ size: 1, last_modified: 0 }, "/a/b/c"],
        [{ size: 2, last_modified: 0 }, "/a/b/d"],
        [{ size: 3, last_modified: 0 }, "/a/e"],
        [{ size: 4, last_modified: 0 }, "/a/f/g"]
      ]))
    );

    const b_id = FilesAndFolders.getIdByName("b", ffs);
    const d_id = FilesAndFolders.getIdByName("d", ffs);
    const e_id = FilesAndFolders.getIdByName("e", ffs);
    const g_id = FilesAndFolders.getIdByName("g", ffs);

    let tags = Tags.empty();
    tags = Tags.update(ffs, tags);

    tags = Tags.push(
      Tag.create("T", Set.of(b_id, d_id)),
      tags
    );
    tags = Tags.push(
      Tag.create("U", Set.of(e_id, d_id)),
      tags
    );
    tags = Tags.push(Tag.create("T", Set.of(g_id)), tags);
    tags = Tags.push(Tag.create("V", Set()), tags);

    tags = Tags.update(ffs, tags);

    const test = ({
      name,
      ff_ids,
      size,
    }) => {
      const a = Tags.getById(Tags.getIdByName(name, tags), tags);

      expect(Tag.getName(a)).to.equal(name);
      expect(Tag.getFfIds(a).sort().toArray()).to.deep.equal(ff_ids.sort());
      expect(Tag.getSize(a)).to.equal(size);
    }

    test({
      name: "T",
      ff_ids: [b_id, d_id, g_id],
      size: 7,
    })

    test({
      name: "U",
      ff_ids: [d_id, e_id],
      size: 5,
    })

    expect(Tags.getIdByName("V", tags)).to.be.null;
  });
});
