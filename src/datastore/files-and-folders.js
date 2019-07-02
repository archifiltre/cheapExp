import * as Arbitrary from "test/arbitrary";
import * as ListUtil from "util/list-util";
import { Origin } from "datastore/origin";
import { List, Map } from "immutable";
import { CSV } from "csv";
import { generateRandomString } from "random-gen";
import { OriginFileElem } from "datastore/origin-file-elem";
import { FileOrFolder } from "datastore/file-or-folder";
import pick from "languages";

const Path = require("path");


const makeId = () => generateRandomString(40);
// const rootId = (() => {
//   const id = makeId();
//   return () => id;
// })();
const rootId = () => "";
const rootName = () => "";

const empty = () => {
  let a = Map();
  a = setById(rootId(), FileOrFolder.empty(), a);
  return a;
}


const toIdArray = a => a.keySeq().toArray();

const arbitrary = () => {
  let ans = empty();

  const num = Math.floor(Math.random() * 100);

  Array(num).fill().forEach(() => {
    const id = makeId();
    const elem = FileOrFolder.arbitrary();

    const id_array = toIdArray(ans);
    const random_parent_id = id_array[id_array.length - 1];

    ans = updateById(
      random_parent_id,
      a => FileOrFolder.pushToChildren(id, a),
      ans
    )

    ans = setById(
      id,
      FileOrFolder.setParent(random_parent_id, elem),
      ans,
    );    
  })

  return ans;
}



const numbreOfFileOrFolder = (a) => {
  return a.size;
}

const nameArrayToId = (name_array, ffs) => {
  const removeRootName = a => a.slice(1)
  name_array = removeRootName(name_array);

  let curr_id = rootId();
  for (let i = 0; i < name_array.length; i++) {
    const name = name_array[i]
    const node = FilesAndFolders.getById(curr_id, ffs);
    const children = FileOrFolder.getChildren(node);

    const filtered_children = children.filter(id => {
      const child = FilesAndFolders.getById(id, ffs);
      const child_name = FileOrFolder.getName(child);
      return child_name === name;
    })

    if (0 < filtered_children.size) {
      const child_id = filtered_children.get(0);
      curr_id = child_id;
    } else {
      curr_id = null;
      break;
    }
  };
  return curr_id;
}

const idToNameArray = (id, ffs) => {
  const ff = getById(id, ffs);
  const parent = FileOrFolder.getParent(ff);

  if (parent === null) {
    return [rootName()];
  } else {
    const name = FileOrFolder.getName(ff);
    return idToNameArray(parent, ffs).concat([name]);
  }
}

const getById = (id, a) => {
  return a.get(id);
}

const setById = (id, ff, a) => {
  return a.set(id, ff);
}

const updateById = (id, f, a) => {
  return setById(id, f(getById(id, a)), a);
}

const toJs = (a) => {
  a = a.map(FileOrFolder.toJs);
  a = a.toObject();
  return a;
}

const fromJs = (a) => {
  a = Map(a);
  a = a.map(FileOrFolder.fromJs);
  return a;
}

const fromOrigin = (origin) => {
  let a = empty();

  const addToFFsAndReturnItsId = (name_array, parent_id) => {
    const id = nameArrayToId(name_array, a);
    if (id !== null) {
      return id;
    } else {
      const name = name_array[name_array.length - 1];
      const elem = FileOrFolder.create(name, parent_id);
      const child_id = makeId();
      a = setById(child_id, elem, a);
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

    const names = path.split("/");

    let parent_id = rootId();
    names.forEach((name, i) => {
      if (i === 0) {
        return;
      }
      const name_array = names.slice(0, i + 1);
      parent_id = addToFFsAndReturnItsId(name_array, parent_id);
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

const toOrigin = (a) => {
  const origin = Origin.empty();

  const rec = (id, names) => {
    const elem = getById(id, a);
    const children = FileOrFolder.getChildren(elem);
    const name = FileOrFolder.getName(elem);

    if (children.size === 0) {
      const path = names.concat([name]).join("/");
      const file_size = FileOrFolder.getFileSize(elem);
      const file_last_modified = FileOrFolder.getFileLastModified(elem);

      const ori_elem = OriginFileElem.create(file_size, file_last_modified, path);

      Origin.push(ori_elem, origin);
    } else {
      children.forEach((id) => rec(id, names.concat([name])));
    }
  }

  rec(rootId(), []);

  return origin;
}



const computeDerived = a => {
  const removeOldDerivedData = () => {
    a = a.map(FileOrFolder.reinitDerivedData);
  };

  const rec = (id, depth) => {
    let elem = getById(id, a);
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
        const elem = getById(id, a);

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
          (id)=>FileOrFolder.getSize(getById(id, a)),
          children
        ).reverse(),
        elem
      )
      elem = FileOrFolder.setSortByDateIndex(
        ListUtil.indexSort(
          (id)=>FileOrFolder.getLastModifiedAverage(getById(id, a)),
          children
        ),
        elem
      )
    }

    a = setById(id, elem, a);
  }

  removeOldDerivedData(a);
  const init_depth = 0;
  rec(rootId(), init_depth);

  return a;
}

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

const toStrList2 = (ff_id_list, ffs) => {
  const ans = [str_list_2_header.slice()];
  const mapFfidToStrList = {};

  ffs.forEach((ff, id) => {
    if (id === rootId()) {
      return undefined;
    }
    const names = idToNameArray(id, ffs);
    const platform_dependent_path = names.join(Path.sep);
    const path_length = platform_dependent_path.length;
    const name = FileOrFolder.getName(ff);
    const extension = Path.extname(name);
    const size = FileOrFolder.getSize(ff);
    const last_modified = CSV.epochToFormatedUtcDateString(
      FileOrFolder.getLastModifiedMax(ff)
    );
    const alias = FileOrFolder.getAlias(ff);
    const comments = FileOrFolder.getComments(ff);
    const children = FileOrFolder.getChildren(ff);
    let file_or_folder = folder_str;
    if (children.size === 0) {
      file_or_folder = file_str;
    }
    const depth = FileOrFolder.getDepth(ff);

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


const toResipStrList2 = (ff_id_list, ffs) => {
  const header = ["File", "Content.DescriptionLevel", "Content.Title"];
  const ans = [header];
  const mapFfidToStrList = {};

  ffs.forEach((ff, id) => {
    if (id === rootId()) {
      return undefined;
    }

    const names = idToNameArray(id, ffs);
    const platform_dependent_path = id.split("/").join("\\");

    const title = FileOrFolder.getName(ff);
  
    const children = FileOrFolder.getChildren(ff);
    let description_level = "RecordGrp";
    if (children.size === 0) {
      description_level = "Item";
    }

    mapFfidToStrList[id] = [
      platform_dependent_path,
      description_level,
      title,
    ];
  });

  ff_id_list.forEach(id=>ans.push(mapFfidToStrList[id]));

  return ans;
}





export const FilesAndFolders = {
  rootId,
  rootName,

  empty,
  arbitrary,

  toIdArray,

  getById,
  updateById,

  computeDerived,
  nameArrayToId,
  idToNameArray,

  toOrigin,
  fromOrigin,

  toJs,
  fromJs,

  toStrList2,
  toResipStrList2,
}



