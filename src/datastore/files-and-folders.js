import * as Arbitrary from "test/arbitrary";

import * as ArrayUtil from "util/array-util";
import * as ListUtil from "util/list-util";
import { Record } from "immutable";

import * as ObjectUtil from "util/object-util";

import * as Origin from "datastore/origin";

import { List, Map } from "immutable";

import { CSV } from "csv";

import pick from "languages";
const Path = require("path");

const fileOrFolderFactory = Record({
  name: "",
  alias: "",
  comments: "",
  children: List(),
  file_size: 0,
  file_last_modified: 0,


  size: 0,
  last_modified_max: 0,
  last_modified_list: List(),
  last_modified_min: Number.MAX_SAFE_INTEGER,
  last_modified_median: null,
  last_modified_average: null,
  depth: 0,
  nb_files: 0,
  sort_by_size_index: List(),
  sort_by_date_index: List(),
})

const reinitDerivatedData = (a) => {
  a = a.set("size", 0);
  a = a.set("last_modified_max", 0);
  a = a.set("last_modified_list", List());
  a = a.set("last_modified_min", Number.MAX_SAFE_INTEGER);
  a = a.set("last_modified_median", null);
  a = a.set("last_modified_average", null);
  a = a.set("depth", 0);
  a = a.set("nb_files", 0);
  a = a.set("sort_by_size_index", List());
  a = a.set("sort_by_date_index", List());

  return a;
}

const copyDerivatedData = (fromA, toB) => {
  toB = toB.set("size", fromA.get("size"));
  toB = toB.set("last_modified_max", fromA.get("last_modified_max"));
  toB = toB.set("last_modified_list", fromA.get("last_modified_list"));
  toB = toB.set("last_modified_min", fromA.get("last_modified_min"));
  toB = toB.set("last_modified_median", fromA.get("last_modified_median"));
  toB = toB.set("last_modified_average", fromA.get("last_modified_average"));
  toB = toB.set("depth", fromA.get("depth"));
  toB = toB.set("nb_files", fromA.get("nb_files"));
  toB = toB.set("sort_by_size_index", fromA.get("sort_by_size_index"));
  toB = toB.set("sort_by_date_index", fromA.get("sort_by_date_index"));

  return toB;
}

const fileOrFolderToJs = (a) => {
  return {
    name: a.get("name"),
    alias: a.get("alias"),
    comments: a.get("comments"),
    children: a.get("children").toArray(),
    file_size: a.get("file_size"),
    file_last_modified: a.get("file_last_modified"),

    size: a.get("size"),
    last_modified_max: a.get("last_modified_max"),
    last_modified_list: a.get("last_modified_list").toArray(),
    last_modified_min: a.get("last_modified_min"),
    last_modified_median: a.get("last_modified_median"),
    last_modified_average: a.get("last_modified_average"),
    depth: a.get("depth"),
    nb_files: a.get("nb_files"),
    sort_by_size_index: a.get("sort_by_size_index").toArray(),
    sort_by_date_index: a.get("sort_by_date_index").toArray(),
  }
}

const fileOrFolderFromJs = (a) => {
  return fileOrFolderFactory({
    name: a.name,
    alias: a.alias,
    comments: a.comments,
    children: List(a.children),
    file_size: a.file_size,
    file_last_modified: a.file_last_modified,

    size: a.size,
    last_modified_max: a.last_modified_max,
    last_modified_list: List(a.last_modified_list),
    last_modified_min: a.last_modified_min,
    last_modified_median: a.last_modified_median,
    last_modified_average: a.last_modified_average,
    depth: a.depth,
    nb_files: a.nb_files,
    sort_by_size_index: List(a.sort_by_size_index),
    sort_by_date_index: List(a.sort_by_date_index),
  })
}


export const ff = a => {
  const mapper = ([file, path]) => {
    const names = path.split("/");
    const ids = names.map((name, i) => names.slice(0, i + 1).join("/"));
    const childrens = ids
      .slice(1)
      .map(a => List.of(a))
      .concat([List()]);
    let m = Map();

    const loop = ArrayUtil.zip([names, ids, childrens]);
    loop.forEach(([name, id, children]) => {
      m = m.set(
        id,
        fileOrFolderFactory({
          name,
          children
        })
      );
    });

    ids.slice(-1).forEach(id => {
      m = m.update(id, a => {
        a = a.set("file_size", file.size);
        a = a.set("file_last_modified", file.lastModified);
        return a;
      });
    });
    return m;
  };

  return a.map(mapper).reduce((acc, val) => merge(val, acc), empty());
};

export const getFfRootId = () => "";

export const empty = () =>
  Map({
    [getFfRootId()]: fileOrFolderFactory()
  });


export const toJs = (a) => {
  a = a.map(fileOrFolderToJs);
  a = a.toObject();
  return a;
}

export const fromJs = (a) => {
  a = Map(a);
  a = a.map(fileOrFolderFromJs);
  return a;
}




export const merge = (a, b) => {
  const merger = (oldVal, newVal) => {
    oldVal = oldVal.update("children", b =>
      b.concat(newVal.get("children").filter(a => b.includes(a) === false))
    );
    return oldVal;
  };
  return b.mergeWith(merger, a);
};

const reduce = (reducer, m) => {
  const rec = id => {
    const node = m.get(id);
    const children_ans_array = node
      .get("children")
      .toArray()
      .map(rec);
    const [ans, next_node] = reducer([children_ans_array, node]);
    m = m.set(id, next_node);
    return ans;
  };

  return [rec(getFfRootId()), m];
};

const dive = (diver, first_ans, m) => {
  const rec = (parent_ans, id) => {
    const node = m.get(id);
    const [ans, next_node] = diver([parent_ans, node]);
    m = m.set(id, next_node);
    node.get("children").forEach(id => rec(ans, id));
  };
  rec(first_ans, "");

  return m;
};

export const ffInv = m => {
  const reducer = ([children_ans_array, node]) => {
    if (children_ans_array.length === 0) {
      const file = {
        size: node.get("file_size"),
        lastModified: node.get("file_last_modified")
      };
      const path = node.get("name");
      const ans = [[file, path]];
      return [ans, node];
    } else {
      children_ans_array = ArrayUtil.join(children_ans_array);
      const ans = children_ans_array.map(a => {
        const path = node.get("name") + "/" + a[1];
        return [a[0], path];
      });

      return [ans, node];
    }
  };
  const [ans, _] = reduce(reducer, m);
  return ans;
};

export const arbitrary = () => {
  return ff(Origin.arbitrary()).map(a => {
    a.set("alias", Arbitrary.string());
    a.set("comments", Arbitrary.string());
    return a;
  });
};


const mergeDerived = (a, b) => {
  b = b.update("size", b => b + a.get("size"));
  b = b.update("last_modified_list", b =>
    b.concat(a.get("last_modified_list"))
  );
  b = b.update("nb_files", b => b + a.get("nb_files"));
  return b;
};

const afterMergeDerived = a => {
  const list = a.get("last_modified_list");
  a = a.set("last_modified_max", list.max());
  a = a.set("last_modified_min", list.min());
  a = a.set("last_modified_median", ListUtil.median(list));
  a = a.set("last_modified_average", ListUtil.average(list));
  return a;
};

const sortChildren = (children_ans_array, a) => {
  const children_ans = List(children_ans_array);
  a = a.set(
    "sort_by_size_index",
    ListUtil.indexSort(a => a.get("size"), children_ans).reverse()
  );
  a = a.set(
    "sort_by_date_index",
    ListUtil.indexSort(a => a.get("last_modified_average"), children_ans)
  );
  return a;
};

export const computeDerived = m => {
  m = m.map(reinitDerivatedData)

  const reducer = ([children_ans_array, node]) => {
    if (children_ans_array.length === 0) {
      const flm = node.get("file_last_modified");
      const size = node.get("file_size");

      node = node.set("size", size);
      node = node.set("last_modified_max", flm);
      node = node.set("last_modified_list", List.of(flm));
      node = node.set("last_modified_min", flm);
      node = node.set("last_modified_median", flm);
      node = node.set("last_modified_average", flm);
      node = node.set("nb_files", 1);

    } else {
      let ans = children_ans_array.reduce((acc, val) => mergeDerived(val, acc));
      ans = afterMergeDerived(ans);
      ans = sortChildren(children_ans_array, ans);

      node = copyDerivatedData(ans, node)
    }

    return [node, node];
  };
  let [_, next_m] = reduce(reducer, m);

  const diver = ([parent_ans, node]) => {
    node = node.set("depth", parent_ans);
    parent_ans = parent_ans + 1;
    return [parent_ans, node];
  };
  next_m = dive(diver, 0, next_m);

  return next_m;
};

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
