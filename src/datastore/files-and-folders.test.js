import chai from "chai";
const expect = chai.expect;

import { Quickcheck } from "test/quickcheck";
import { FilesAndFolders } from "datastore/files-and-folders";
import { FileOrFolder } from "datastore/file-or-folder";
import { Origin } from "datastore/origin";

describe("files-and-folders", () => {
  Quickcheck.loop("nameArrayToId . idToNameArray == identity", () => {
    const a = FilesAndFolders.arbitrary();

    const id_array = FilesAndFolders.toIdArray(a);
    const rand_id = id_array[Math.floor(Math.random() * id_array.length)];

    const name_array = FilesAndFolders.idToNameArray(rand_id, a);
    const ans_id = FilesAndFolders.nameArrayToId(name_array, a);

    expect(ans_id).to.equal(rand_id);
  });


  Quickcheck.loop("toOrigin . fromOrigin == identity", () => {
    const a = Origin.arbitrary();
    expect(
      Origin.sort(FilesAndFolders.toOrigin(FilesAndFolders.fromOrigin(a)))
    ).to.deep.equal(
      Origin.sort(a)
    );
  });


  Quickcheck.loop("fromJs . toJs == identity", () => {
    const a = FilesAndFolders.computeDerived(FilesAndFolders.arbitrary());
    expect(
      FilesAndFolders.fromJs(FilesAndFolders.toJs(a)).toJS()
    ).to.deep.equal(
      a.toJS()
    );
  });

  Quickcheck.loop("toOrigin . fromJs . toJs . computeDerived . fromOrigin == identity", () => {
    const a = Origin.arbitrary();
    expect(
      Origin.sort(FilesAndFolders.toOrigin(FilesAndFolders.fromJs(FilesAndFolders.toJs(FilesAndFolders.computeDerived(FilesAndFolders.fromOrigin(a)))))),
    ).to.deep.equal(
      Origin.sort(a)
    );
  });

  it("idToNameArray", () => {
    const origin = Origin.fromJs([
      [{ size: 1, last_modified: 5 }, "/a/b/c"],
      [{ size: 2, last_modified: 4 }, "/a/b/d"],
      [{ size: 3, last_modified: 3 }, "/a/e/f"],
      [{ size: 4, last_modified: 2 }, "/a/e/g"],
      [{ size: 5, last_modified: 1 }, "/h"]
    ]);
    const data = FilesAndFolders.fromOrigin(origin);

    const root_name = FilesAndFolders.rootName();

    const f_id = FilesAndFolders.nameArrayToId([root_name, "a", "e", "f"], data);
    let names = FilesAndFolders.idToNameArray(f_id, data);

    expect(names).to.deep.equal([root_name, "a", "e", "f"]);

    const a_id = FilesAndFolders.nameArrayToId([root_name, "a"], data);
    names = FilesAndFolders.idToNameArray(a_id, data);

    expect(names).to.deep.equal([root_name, "a"]);

    const root_id = FilesAndFolders.nameArrayToId([root_name], data);
    names = FilesAndFolders.idToNameArray(root_id, data);

    expect(names).to.deep.equal([root_name]);
  });


  it("simple toStrList2 test", () => {
    const origin = Origin.fromJs([
      [{ size: 1, last_modified: 5 }, "/a/b/c"],
      [{ size: 2, last_modified: 4 }, "/a/b/d"],
      [{ size: 3, last_modified: 3 }, "/a/e/f"],
      [{ size: 4, last_modified: 2 }, "/a/e/g"],
      [{ size: 5, last_modified: 1 }, "/h.extension"]
    ]);
    const data = FilesAndFolders.fromOrigin(origin);
    let derived = FilesAndFolders.computeDerived(data);

    const root_name = FilesAndFolders.rootName();

    const d_id = FilesAndFolders.nameArrayToId([root_name, "a", "b", "d"], derived);
    derived = FilesAndFolders.updateById(
      d_id,
      a => FileOrFolder.setAlias("alias", a),
      derived
    );

    const e_id = FilesAndFolders.nameArrayToId([root_name, "a", "e"], derived);
    derived = FilesAndFolders.updateById(
      e_id,
      a => FileOrFolder.setComments("comments", a),
      derived
    )

    const h_id = FilesAndFolders.nameArrayToId(["", "h.extension"], derived);

    const ids = [d_id, e_id, h_id];
    const str_list_2 = FilesAndFolders.toStrList2(ids, derived);

    expect(str_list_2).to.deep.equal([
      ["","path","path length","name","extension","size (octet)","last_modified","alias","comments","file/folder","depth",],
      ["","/a/b/d",6,"d","",2,"01/01/1970","alias","","file",3],
      ["","/a/e",4,"e","",7,"01/01/1970","","comments","folder",2],
      ["","/h.extension",12,"h.extension",".extension",5,"01/01/1970","","","file",1],
    ])
  });





  it("simple derived data test", () => {
    const origin = Origin.fromJs([
      [{ size: 1, last_modified: 5 }, "/a/b/c"],
      [{ size: 2, last_modified: 4 }, "/a/b/d"],
      [{ size: 3, last_modified: 3 }, "/a/e/f"],
      [{ size: 4, last_modified: 2 }, "/a/e/g"],
      [{ size: 5, last_modified: 1 }, "/h"]
    ]);
    const data = FilesAndFolders.fromOrigin(origin);
    const derived = FilesAndFolders.computeDerived(data);

    const root_name = FilesAndFolders.rootName();

    const test = ({
      name_array,
      name,
      alias,
      comments,
      children,
      size,
      last_modified_max,
      last_modified_list,
      last_modified_min,
      last_modified_median,
      last_modified_average,
      depth,
      nb_files,
      sort_by_size_index,
      sort_by_date_index,
    }) => {
      const a = FilesAndFolders.getById(
        FilesAndFolders.nameArrayToId(name_array, derived),
        derived
      );

      expect(FileOrFolder.getName(a)).to.equal(name);
      expect(FileOrFolder.getAlias(a)).to.equal(alias);
      expect(FileOrFolder.getComments(a)).to.equal(comments);
      expect(FileOrFolder.getChildren(a).sort().toArray()).to.deep.equal(children.sort());

      expect(FileOrFolder.getSize(a)).to.equal(size);
      expect(FileOrFolder.getLastModifiedMax(a)).to.equal(last_modified_max);
      expect(
        FileOrFolder.getLastModifiedList(a).sort().toArray()
      ).to.deep.equal(
        last_modified_list.sort()
      );
      expect(FileOrFolder.getLastModifiedMin(a)).to.equal(last_modified_min);
      expect(FileOrFolder.getLastModifiedMedian(a)).to.equal(last_modified_median);
      expect(FileOrFolder.getLastModifiedAverage(a)).to.equal(last_modified_average);
      expect(FileOrFolder.getDepth(a)).to.equal(depth);
      expect(FileOrFolder.getNbFiles(a)).to.equal(nb_files);
      expect(FileOrFolder.getSortBySizeIndex(a).toArray()).to.deep.equal(sort_by_size_index);
      expect(FileOrFolder.getSortByDateIndex(a).toArray()).to.deep.equal(sort_by_date_index);
    }

    test({
      name_array: [root_name],
      name: "",
      alias: "",
      comments: "",
      children: [
        FilesAndFolders.nameArrayToId([root_name, "a"], derived),
        FilesAndFolders.nameArrayToId([root_name, "h"], derived)
      ],
      size: 15,
      last_modified_max: 5,
      last_modified_list: [1, 2, 3, 4, 5],
      last_modified_min: 1,
      last_modified_median: 3,
      last_modified_average: 3,
      depth: 0,
      nb_files: 5,
      sort_by_size_index: [0, 1],
      sort_by_date_index: [1, 0],
    })


    test({
      name_array: [root_name, "h"],
      name: "h",
      alias: "",
      comments: "",
      children: [],
      size: 5,
      last_modified_max: 1,
      last_modified_list: [1],
      last_modified_min: 1,
      last_modified_median: 1,
      last_modified_average: 1,
      depth: 1,
      nb_files: 1,
      sort_by_size_index: [],
      sort_by_date_index: [],
    })

    test({
      name_array: [root_name, "a"],
      name: "a",
      alias: "",
      comments: "",
      children: [
        FilesAndFolders.nameArrayToId([root_name, "a", "b"], derived),
        FilesAndFolders.nameArrayToId([root_name, "a", "e"], derived)
      ],
      size: 10,
      last_modified_max: 5,
      last_modified_list: [2, 3, 4, 5],
      last_modified_min: 2,
      last_modified_median: 3.5,
      last_modified_average: 3.5,
      depth: 1,
      nb_files: 4,
      sort_by_size_index: [1, 0],
      sort_by_date_index: [1, 0],
    })

    test({
      name_array: [root_name, "a", "b"],
      name: "b",
      alias: "",
      comments: "",
      children: [
        FilesAndFolders.nameArrayToId([root_name, "a", "b", "c"], derived),
        FilesAndFolders.nameArrayToId([root_name, "a", "b", "d"], derived)
      ],
      size: 3,
      last_modified_max: 5,
      last_modified_list: [4, 5],
      last_modified_min: 4,
      last_modified_median: 4.5,
      last_modified_average: 4.5,
      depth: 2,
      nb_files: 2,
      sort_by_size_index: [1, 0],
      sort_by_date_index: [1, 0],
    })

    test({
      name_array: [root_name, "a", "b", "c"],
      name: "c",
      alias: "",
      comments: "",
      children: [],
      size: 1,
      last_modified_max: 5,
      last_modified_list: [5],
      last_modified_min: 5,
      last_modified_median: 5,
      last_modified_average: 5,
      depth: 3,
      nb_files: 1,
      sort_by_size_index: [],
      sort_by_date_index: [],
    })

    test({
      name_array: [root_name, "a", "b", "d"],
      name: "d",
      alias: "",
      comments: "",
      children: [],
      size: 2,
      last_modified_max: 4,
      last_modified_list: [4],
      last_modified_min: 4,
      last_modified_median: 4,
      last_modified_average: 4,
      depth: 3,
      nb_files: 1,
      sort_by_size_index: [],
      sort_by_date_index: [],
    })

    test({
      name_array: [root_name, "a", "e"],
      name: "e",
      alias: "",
      comments: "",
      children: [
        FilesAndFolders.nameArrayToId([root_name, "a", "e", "f"], derived),
        FilesAndFolders.nameArrayToId([root_name, "a", "e", "g"], derived)
      ],
      size: 7,
      last_modified_max: 3,
      last_modified_list: [2, 3],
      last_modified_min: 2,
      last_modified_median: 2.5,
      last_modified_average: 2.5,
      depth: 2,
      nb_files: 2,
      sort_by_size_index: [1, 0],
      sort_by_date_index: [1, 0],
    })

    test({
      name_array: [root_name, "a", "e", "f"],
      name: "f",
      alias: "",
      comments: "",
      children: [],
      size: 3,
      last_modified_max: 3,
      last_modified_list: [3],
      last_modified_min: 3,
      last_modified_median: 3,
      last_modified_average: 3,
      depth: 3,
      nb_files: 1,
      sort_by_size_index: [],
      sort_by_date_index: [],
    })

    test({
      name_array: [root_name, "a", "e", "g"],
      name: "g",
      alias: "",
      comments: "",
      children: [],
      size: 4,
      last_modified_max: 2,
      last_modified_list: [2],
      last_modified_min: 2,
      last_modified_median: 2,
      last_modified_average: 2,
      depth: 3,
      nb_files: 1,
      sort_by_size_index: [],
      sort_by_date_index: [],
    })


  });
});
