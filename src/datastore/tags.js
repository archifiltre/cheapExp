import * as Arbitrary from "test/arbitrary";

import { generateRandomString } from "random-gen";
import * as ObjectUtil from "util/object-util";
import { Record } from "immutable";

import { List, Map, Set } from "immutable";

import { Tag } from "datastore/tag";

import { FilesAndFolders } from "datastore/files-and-folders";
import { FileOrFolder } from "datastore/file-or-folder";


const makeId = () => generateRandomString(40);

const empty = () => {
  return Map()
};

const arbitrary = () => {
  let a = empty();

  const size = Math.floor(Math.random() * 100);

  Array(size).fill().forEach(() => {
    a = push(Tag.arbitrary(), a);
  });

  return a;
};

const toJs = (a) => {
  a = a.map(Tag.toJs);
  a = a.toObject();

  return a;
};

const fromJs = (a) => {
  a = Map(a);
  a = a.map(Tag.fromJs);

  return a;
}

const toIdArray = a => a.keySeq().toArray()

const getById = (id, tags) => {
  return tags.get(id);
}

const setById = (id, tag, tags) => {
  return tags.set(id, tag);
}

const deleteById = (id, tags) => {
  return tags.delete(id);
}

const updateById = (id, f, tags) => {
  return setById(id, f(getById(id, tags)), tags);
}

const push = (tag, tags) => setById(makeId(), tag, tags);


const getIdByName = (name, tags) => {
  return tags.reduce((acc, val, id) => {
    if (Tag.getName(val) === name) {
      acc = id;
    }
    return acc;
  }, null);
}

const getIdArrayByFfId = (ff_id, tags) => {
  tags = tags.filter(a => Tag.getFfIds(a).includes(ff_id));

  return toIdArray(tags);
}

const insertAndHandleTagWithSameName = (id, tag, tags) => {
  const already_id = getIdByName(Tag.getName(tag), tags);

  if (already_id !== null) {
    tags = tags.update(
      already_id,
      a => Tag.updateFfIds(ff_ids => ff_ids.concat(Tag.getFfIds(tag)), a)
    );
  } else {
    tags = setById(id, tag, tags);
  }
  return tags;
};


const computeDerived = (ffs, tags) => {
  const sortBySize = ids => {
    const compare = (a, b) => {
      const s_a = FileOrFolder.getSize(FilesAndFolders.getById(a, ffs));
      const s_b = FileOrFolder.getSize(FilesAndFolders.getById(b, ffs));
      if (s_a > s_b) {
        return -1;
      } else if (s_a === s_b) {
        return 0;
      } else {
        return 1;
      }
    };
    const sizes = ids.sort(compare);
    return sizes;
  };

  const filterChildren = ids => {
    const getAllChildren = id => {
      const children = FileOrFolder.getChildren(FilesAndFolders.getById(id, ffs));
      return children.concat(
        children
          .map(getAllChildren)
          .reduce((acc, val) => acc.concat(val), List())
      );
    };

    if (ids.size <= 1) {
      return ids;
    } else {
      const head_id = ids.get(0);
      const head_id_children = getAllChildren(head_id);

      const tail = ids.slice(1);
      const tail_without_head_id_children = tail.filter(
        a => head_id_children.includes(a) === false
      );

      return List.of(head_id).concat(filterChildren(tail_without_head_id_children));
    }
  };

  const reduceToSize = ids => {
    return ids.reduce(
      (acc, val) => {
        return acc + FileOrFolder.getSize(FilesAndFolders.getById(val, ffs))
      },
      0
    );
  };

  tags = tags.map(tag => {
    const ids = List(Tag.getFfIds(tag));

    tag = Tag.setSize(
      reduceToSize(filterChildren(sortBySize(ids))),
      tag
    );

    return tag;
  });

  return tags;
};

const update = (ffs, tags) => {
  tags = tags.reduce(
    (acc, val, id) => insertAndHandleTagWithSameName(id, val, acc),
    empty()
  );
  tags = tags.filter(val => Tag.getFfIds(val).size !== 0);
  tags = computeDerived(ffs, tags);

  return tags;
};


const toNameArray = (tags) => {
  return tags.map(Tag.getName).valueSeq().toArray().sort();
}


// Parent tags are inherits by children
const toStrList2 = (ff_id_list, ffs, tags) => {
  const name_list = toNameArray(tags);
  const header = name_list
    .map((tag_name,i) => "tag" + i + " : " + tag_name);
  const mapFfidToStrList = {};

  const depthFirstSearchRec = (parent_tag, curr_ff_id) => {
    const curr_ff = FilesAndFolders.getById(curr_ff_id, ffs);
    let curr_ff_tags_name = toNameArray(
      tags.filter(tag => Tag.getFfIds(tag).includes(curr_ff_id))
    );
    curr_ff_tags_name = curr_ff_tags_name.concat(parent_tag);

    mapFfidToStrList[curr_ff_id] = name_list.map((tag_name) => {
      if (curr_ff_tags_name.includes(tag_name)) {
        return tag_name;
      } else {
        return "";
      }
    });

    const curr_ff_children = FileOrFolder.getChildren(curr_ff);
    curr_ff_children.forEach((id) =>
      depthFirstSearchRec(curr_ff_tags_name, id)
    );
  }

  depthFirstSearchRec([], FilesAndFolders.rootId());

  const ans = [header];
  ff_id_list.forEach(id=>ans.push(mapFfidToStrList[id]));
  return ans;
} 

export const Tags = {
  empty,
  arbitrary,
  
  push,

  getIdByName,
  getById,
  updateById,
  deleteById,

  getIdArrayByFfId,
  toIdArray,

  toJs,
  fromJs,

  update,

  toStrList2,
}

