import * as Arbitrary from "test/arbitrary";

import * as ArrayUtil from "util/array-util";
import * as ListUtil from "util/list-util";
import { Record } from "immutable";

import * as ObjectUtil from "util/object-util";

import { Origin } from "datastore/origin";

import { List, Map } from "immutable";

import { CSV } from "csv";
import { generateRandomString } from "random-gen";

import { OriginFileElem } from "datastore/origin-file-elem";
import { FileOrFolder } from "datastore/file-or-folder";

import pick from "languages";
const Path = require("path");


const makeId = () => generateRandomString(40);
const rootId = () => "";
const rootName = () => "";

export const empty = () => {
  let a = Map();
  a = a.set(rootId(), FileOrFolder.empty());
  return a;
}

const getIdByName = (name, a) => {
  const ans = a.findEntry((elem, id) => {
    return FileOrFolder.getName(elem) === name
  })

  if (ans !== undefined) {
    return ans[0];
  } else {
    return null;
  }
}

export const arbitrary = () => {
  return fromOrigin(Origin.arbitrary())
    .map(a => {
      a = FileOrFolder.setAlias(Arbitrary.string(), a);
      a = FileOrFolder.setComments(Arbitrary.string(), a);

      return a;
    });
}

export const toJs = (a) => {
  a = a.map(FileOrFolder.toJs);
  a = a.toObject();
  return a;
}

export const fromJs = (a) => {
  a = Map(a);
  a = a.map(FileOrFolder.fromJs);
  return a;
}

export const fromOrigin = (origin) => {
  let a = empty();

  const addToFFsAndReturnItsId = (name, parent_id) => {
    const id = getIdByName(name, a);
    if (id !== null) {
      return id;
    } else {
      const elem = FileOrFolder.create(name);
      const child_id = makeId();
      a = a.set(child_id, elem);
        a = a.update(parent_id, (elem) => {
          elem = FileOrFolder.pushToChildren(child_id, elem);
          return elem;
        });
      return child_id;
    }
  }

  Origin.forEach((elem) => {
    const path = OriginFileElem.getPath(elem);
    const file_size = OriginFileElem.getSize(elem);
    const file_last_modified = OriginFileElem.getLastModified(elem);

    const names = path.split("/").slice(1);

    let parent_id = rootId();
    names.forEach((name, i) => {
      parent_id = addToFFsAndReturnItsId(name, parent_id);
    });

    let last_id = parent_id;
    a = a.update(last_id, (elem) => {
      elem = FileOrFolder.setFileSize(file_size, elem);
      elem = FileOrFolder.setFileLastModified(file_last_modified, elem);
      return elem;
    });

  }, origin);

  return a;
}

export const toOrigin = (a) => {
  const origin = Origin.empty();

  const rec = (id, names) => {
    const elem = a.get(id);
    const children = FileOrFolder.getChildren(elem);
    const name = FileOrFolder.getName(elem);

    if (children.size === 0) {
      const path = names.join("/");
      const file_size = FileOrFolder.getFileSize(elem);
      const file_last_modified = FileOrFolder.getFileLastModified(elem);

      const ori_elem = OriginFileElem.create(file_size, file_last_modified, path);

      Origin.push(ori_elem, origin);
    } else {
      children.forEach((id) => rec(id, names.concat([name])));
    }
  }

  rec(rootId(), [rootName()]);

  return origin;
}



export const computeDerived = a => {
  const removeOldDerivatedData = () => {
    a = a.map(FileOrFolder.reinitDerivatedData);
  };

  const rec = (id, depth) => {
    let elem = a.get(id);
    const children = FileOrFolder.getChildren(elem);

    elem = FileOrFolder.setDepth(depth, elem);

    if (children.size === 0) {
      const flm = FileOrFolder.getFileLastModified(elem);
      const size = FileOrFolder.getFileSize(elem);

      elem = FileOrFolder.setSize(size, elem);
      elem = FileOrFolder.setLastModifiedMax(flm, elem);
      elem = FileOrFolder.setLastModifiedList(List.of(flm), elem);
      elem = FileOrFolder.setLastModifiedMin(flm, elem);
      elem = FileOrFolder.setLastModifiedMedian(flm, elem);
      elem = FileOrFolder.setLastModifiedAverage(flm, elem);
      elem = FileOrFolder.setNbFiles(1, elem);
    } else {
      children.forEach((id) => {
        rec(id, depth + 1);
      })
      let size = 0;
      let list = List();
      let nb_files = 0;
      children.forEach((id) => {
        const elem = a.get(id);

        size += FileOrFolder.getSize(elem);
        list = list.concat(FileOrFolder.getLastModifiedList(elem));
        nb_files += FileOrFolder.getNbFiles(elem);
      })

      elem = FileOrFolder.setSize(size, elem);
      elem = FileOrFolder.setLastModifiedMax(list.max(), elem);
      elem = FileOrFolder.setLastModifiedList(list, elem);
      elem = FileOrFolder.setLastModifiedMin(list.min(), elem);
      elem = FileOrFolder.setLastModifiedMedian(ListUtil.median(list), elem);
      elem = FileOrFolder.setLastModifiedAverage(ListUtil.average(list), elem);
      elem = FileOrFolder.setNbFiles(nb_files, elem);

      elem = FileOrFolder.setSortBySizeIndex(
        ListUtil.indexSort(
          (id)=>FileOrFolder.getSize(a.get(id)),
          children
        ).reverse(),
        elem
      )
      elem = FileOrFolder.setSortByDateIndex(
        ListUtil.indexSort(
          (id)=>FileOrFolder.getLastModifiedAverage(a.get(id)),
          children
        ),
        elem
      )
    }

    a = a.set(id, elem);
  }

  removeOldDerivatedData(a);
  const init_depth = 0;
  rec(rootId(), init_depth);

  return a;
}




























// const fileOrFolderFactory = Record({
//   name: "",
//   alias: "",
//   comments: "",
//   children: List(),
//   file_size: 0,
//   file_last_modified: 0,


//   size: 0,
//   last_modified_max: 0,
//   last_modified_list: List(),
//   last_modified_min: Number.MAX_SAFE_INTEGER,
//   last_modified_median: null,
//   last_modified_average: null,
//   depth: 0,
//   nb_files: 0,
//   sort_by_size_index: List(),
//   sort_by_date_index: List(),
// })

// const reinitDerivatedData = (a) => {
//   a = a.set("size", 0);
//   a = a.set("last_modified_max", 0);
//   a = a.set("last_modified_list", List());
//   a = a.set("last_modified_min", Number.MAX_SAFE_INTEGER);
//   a = a.set("last_modified_median", null);
//   a = a.set("last_modified_average", null);
//   a = a.set("depth", 0);
//   a = a.set("nb_files", 0);
//   a = a.set("sort_by_size_index", List());
//   a = a.set("sort_by_date_index", List());

//   return a;
// }

// const copyDerivatedData = (fromA, toB) => {
//   toB = toB.set("size", fromA.get("size"));
//   toB = toB.set("last_modified_max", fromA.get("last_modified_max"));
//   toB = toB.set("last_modified_list", fromA.get("last_modified_list"));
//   toB = toB.set("last_modified_min", fromA.get("last_modified_min"));
//   toB = toB.set("last_modified_median", fromA.get("last_modified_median"));
//   toB = toB.set("last_modified_average", fromA.get("last_modified_average"));
//   toB = toB.set("depth", fromA.get("depth"));
//   toB = toB.set("nb_files", fromA.get("nb_files"));
//   toB = toB.set("sort_by_size_index", fromA.get("sort_by_size_index"));
//   toB = toB.set("sort_by_date_index", fromA.get("sort_by_date_index"));

//   return toB;
// }

// const fileOrFolderToJs = (a) => {
//   return {
//     name: a.get("name"),
//     alias: a.get("alias"),
//     comments: a.get("comments"),
//     children: a.get("children").toArray(),
//     file_size: a.get("file_size"),
//     file_last_modified: a.get("file_last_modified"),

//     size: a.get("size"),
//     last_modified_max: a.get("last_modified_max"),
//     last_modified_list: a.get("last_modified_list").toArray(),
//     last_modified_min: a.get("last_modified_min"),
//     last_modified_median: a.get("last_modified_median"),
//     last_modified_average: a.get("last_modified_average"),
//     depth: a.get("depth"),
//     nb_files: a.get("nb_files"),
//     sort_by_size_index: a.get("sort_by_size_index").toArray(),
//     sort_by_date_index: a.get("sort_by_date_index").toArray(),
//   }
// }
// fileOrFolderFromJs
// const  = (a) => {
//   return fileOrFolderFactory({
//     name: a.name,
//     alias: a.alias,
//     comments: a.comments,
//     children: List(a.children),
//     file_size: a.file_size,
//     file_last_modified: a.file_last_modified,

//     size: a.size,
//     last_modified_max: a.last_modified_max,
//     last_modified_list: List(a.last_modified_list),
//     last_modified_min: a.last_modified_min,
//     last_modified_median: a.last_modified_median,
//     last_modified_average: a.last_modified_average,
//     depth: a.depth,
//     nb_files: a.nb_files,
//     sort_by_size_index: List(a.sort_by_size_index),
//     sort_by_date_index: List(a.sort_by_date_index),
//   })
// }





// export const getFfRootId = () => "";


// const reduce = (reducer, m) => {
//   const rec = id => {
//     const node = m.get(id);
//     const children_ans_array = node
//       .get("children")
//       .toArray()
//       .map(rec);
//     const [ans, next_node] = reducer([children_ans_array, node]);
//     m = m.set(id, next_node);
//     return ans;
//   };

//   return [rec(getFfRootId()), m];
// };

// const dive = (diver, first_ans, m) => {
//   const rec = (parent_ans, id) => {
//     const node = m.get(id);
//     const [ans, next_node] = diver([parent_ans, node]);
//     m = m.set(id, next_node);
//     node.get("children").forEach(id => rec(ans, id));
//   };
//   rec(first_ans, "");

//   return m;
// };




// const mergeDerived = (a, b) => {
//   b = b.update("size", b => b + a.get("size"));
//   b = b.update("last_modified_list", b =>
//     b.concat(a.get("last_modified_list"))
//   );
//   b = b.update("nb_files", b => b + a.get("nb_files"));
//   return b;
// };

// const afterMergeDerived = a => {
//   const list = a.get("last_modified_list");
//   a = a.set("last_modified_max", list.max());
//   a = a.set("last_modified_min", list.min());
//   a = a.set("last_modified_median", ListUtil.median(list));
//   a = a.set("last_modified_average", ListUtil.average(list));
//   return a;
// };

// const sortChildren = (children_ans_array, a) => {
//   const children_ans = List(children_ans_array);
//   a = a.set(
//     "sort_by_size_index",
//     ListUtil.indexSort(a => a.get("size"), children_ans).reverse()
//   );
//   a = a.set(
//     "sort_by_date_index",
//     ListUtil.indexSort(a => a.get("last_modified_average"), children_ans)
//   );
//   return a;
// };

// export const computeDerived = m => {
//   m = m.map(reinitDerivatedData)

//   const reducer = ([children_ans_array, node]) => {
//     if (children_ans_array.length === 0) {
//       const flm = node.get("file_last_modified");
//       const size = node.get("file_size");

//       node = node.set("size", size);
//       node = node.set("last_modified_max", flm);
//       node = node.set("last_modified_list", List.of(flm));
//       node = node.set("last_modified_min", flm);
//       node = node.set("last_modified_median", flm);
//       node = node.set("last_modified_average", flm);
//       node = node.set("nb_files", 1);

//     } else {
//       let ans = children_ans_array.reduce((acc, val) => mergeDerived(val, acc));
//       ans = afterMergeDerived(ans);
//       ans = sortChildren(children_ans_array, ans);

//       node = copyDerivatedData(ans, node)
//     }

//     return [node, node];
//   };
//   let [_, next_m] = reduce(reducer, m);

//   const diver = ([parent_ans, node]) => {
//     node = node.set("depth", parent_ans);
//     parent_ans = parent_ans + 1;
//     return [parent_ans, node];
//   };
//   next_m = dive(diver, 0, next_m);

//   return next_m;
// };


export const toFfidList = a => a.keySeq().toArray();


const str_list_2_header = pick({
  fr:[
    "",
    "chemin",
    "longueur du chemin",
    "nom",
    "extension",
    "poids (octet)",
    "date de dernière modification",
    "alias",
    "commentaire",
    "fichier/répertoire",
    "profondeur",
  ],
  en:[
    "",
    "path",
    "path length",
    "name",
    "extension",
    "size (octet)",
    "last_modified",
    "alias",
    "comments",
    "file/folder",
    "depth",
  ],
});
const file_str = pick({
  fr:"fichier",
  en:"file",
});
const folder_str = pick({
  fr:"répertoire",
  en:"folder",
});

export const toStrList2 = (ff_id_list, ffs) => {
  const ans = [str_list_2_header.slice()];
  const mapFfidToStrList = {};

  ffs.forEach((ff, id) => {
    if (id === "") {
      return undefined;
    }
    const platform_independent_path = id;
    const platform_dependent_path = id.split("/").join(Path.sep);
    const path_length = platform_dependent_path.length;
    const name = ff.get("name");
    const extension = Path.extname(name);
    const size = ff.get("size");
    const last_modified = CSV.epochToFormatedUtcDateString(ff.get("last_modified_max"));
    const alias = ff.get("alias");
    const comments = ff.get("comments");
    const children = ff.get("children");
    let file_or_folder = folder_str;
    if (children.size === 0) {
      file_or_folder = file_str;
    }
    const depth = ff.get("depth");

    mapFfidToStrList[id] = [
      "",
      platform_dependent_path,
      path_length,
      name,
      extension,
      size,
      last_modified,
      alias,
      comments,
      file_or_folder,
      depth,
    ];
  });

  ff_id_list.forEach(id=>ans.push(mapFfidToStrList[id]));

  return ans;
}


export const toResipStrList2 = (ff_id_list, ffs) => {
  const header = ["File", "Content.DescriptionLevel", "Content.Title"];
  const ans = [header];
  const mapFfidToStrList = {};

  ffs.forEach((ff, id) => {
    if (id === "") {
      return undefined;
    }
    // const line_id = generateRandomString(40);
    const platform_independent_path = id;
    // const platform_dependent_path = id.split("/").join(Path.sep);
    const platform_dependent_path = id.split("/").join("\\");
    // const path_length = platform_dependent_path.length;
    const title = ff.get("name");
    // const extension = Path.extname(name);
    // const size = ff.get("size");
    // const last_modified = CSV.epochToFormatedUtcDateString(ff.get("last_modified_max"));
    // const alias = ff.get("alias");
    // const comments = ff.get("comments");
    const children = ff.get("children");
    let description_level = "RecordGrp";
    if (children.size === 0) {
      description_level = "Item";
    }
    // const depth = ff.get("depth");

    mapFfidToStrList[id] = [
      platform_dependent_path,
      description_level,
      title,
    ];
  });

  ff_id_list.forEach(id=>ans.push(mapFfidToStrList[id]));

  return ans;
}
