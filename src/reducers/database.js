import { updateIn, getIn, List, Set } from "immutable";

import * as RealEstate from "reducers/real-estate";

import * as Cache from "cache";
import { Origin } from "datastore/origin";
import { VirtualFileSystem } from "datastore/virtual-file-system";
import { FilesAndFolders } from "datastore/files-and-folders";
import { Tags } from "datastore/tags";


import * as SEDA from "seda";



const property_name = "database";

const initialState = () => VirtualFileSystem.make(Origin.empty());

const overallCount = () => state => {
  const ffs = VirtualFileSystem.getFilesAndFolders(state);
  return FilesAndFolders.numbreOfFileOrFolder(ffs);
};

const fileCount = () => state => {
  let ffs = VirtualFileSystem.getFilesAndFolders(state);

  ffs = FilesAndFolders.filter(
    a => FileOrFolder.getChildren(a).size === 0,
    ffs
  );

  return FilesAndFolders.numbreOfFileOrFolder(ffs);
  // state.get("files_and_folders").filter(a => a.get("children").size === 0).size;
}

const getFfByFfId = id => state => {
  const ffs = VirtualFileSystem.getFilesAndFolders(state);
 
  return FilesAndFolders.getById(id, ffs);
  // state.get("files_and_folders").get(id);
}
const rootFfId = () => state => FilesAndFolders.rootId();

const maxDepth = () => state => {
  const ffs = VirtualFileSystem.getFilesAndFolders(state);

  const max_depth = FilesAndFolders.reduce(
    (acc, val) => Math.max(acc, FileOrFolder.getDepth(val)),
    0
  );

  return max_depth;
  // state
  //   .get("files_and_folders")
  //   .map(a => a.get("depth"))
  //   .reduce((acc, val) => Math.max(acc, val), 0);
}

const volume = () => state => {
  const ffs = VirtualFileSystem.getFilesAndFolders(state);

  const root_id = FilesAndFolders.rootId();
  const root_node = FilesAndFolders.getById(root_id, ffs);
  const vol = FileOrFolder.getSize(root_node);

  return vol;

  // getFfByFfId(rootFfId()())(state).get("size");
}

const getFfIdPath = id => state =>
  List(
    id.split("/").map((_, i) =>
      id
        .split("/")
        .slice(0, i + 1)
        .join("/")
    )
  );

const toJson = () => state => JSON.stringify(VirtualFileSystem.toJs(state));


const toStrList2 = () => state => {
  const ffs = VirtualFileSystem.getFilesAndFolders(state);
  const root_id = FilesAndFolders.rootId();
  const ff_id_list = FilesAndFolders.toIdArray(ffs).filter(a=>a!==root_id);
  const tags = VirtualFileSystem.getTags(state);

  const ans = FilesAndFolders.toStrList2(ff_id_list, ffs);

  Tags.toStrList2(ff_id_list, ffs, tags).forEach((a,i) => {
    ans[i] = ans[i].concat(a);
  });

  return ans;
};

const toSIP = () => SEDA.makeSIP;

const getSessionName = () => state => VirtualFileSystem.getSessionName(state);
const getOriginalPath = () => state => VirtualFileSystem.getOriginalPath(state);

const getTagIdsByFfId = id => state => {
  let tags = VirtualFileSystem.getTags(state);

  tags = Tags.filter(a => Tag.getFfIds(a).includes(id));

  return Tags.toIdArray(tags);

  // state
  //   .get("tags")
  //   .filter(tag => tag.get("ff_ids").includes(id))
  //   .keySeq()
  //   .toList();
}
const getAllTagIds = () => state => {
  const tags = VirtualFileSystem.getTags(state);

  return Tags.toIdArray(tags);

  // state
  //   .get("tags")
  //   .keySeq()
  //   .toList();
}

const getTagByTagId = id => state => {
  const tags = VirtualFileSystem.getTags(state);
  return Tags.getById(id, tags);
  // getIn(state, ["tags", id]);
}

// const getWaitingCounter = () => state => 0;

const reader = {
  overallCount,
  fileCount,
  getFfByFfId,
  rootFfId,
  maxDepth,
  volume,
  getFfIdPath,
  toJson,
  toStrList2,
  toSIP,
  getSessionName,
  getOriginalPath,
  getTagIdsByFfId,
  getAllTagIds,
  getTagByTagId,
  // getWaitingCounter
};

const set = next_state => state => next_state;

const reInit = () => state => initialState();

const updateAlias = (updater, id) => state => {
  state = updateIn(state, ["files_and_folders", id, "alias"], updater);
  return state;
};

const updateComments = (updater, id) => state => {
  state = updateIn(state, ["files_and_folders", id, "comments"], updater);
  return state;
};

const setSessionName = name => state => state.set("session_name", name);

const createTagged = (ff_id, name) => state => {
  state = state.update("tags", a =>
    Tags.push(Tags.create({ name, ff_ids: Set.of(ff_id) }), a)
  );
  state = VirtualFileSystem.deriveTags(state);
  return state;
};

const addTagged = (ff_id, tag_id) => state => {
  state = updateIn(state, ["tags", tag_id, "ff_ids"], a => a.add(ff_id));
  state = VirtualFileSystem.deriveTags(state);
  return state;
};

const deleteTagged = (ff_id, tag_id) => state => {
  state = updateIn(state, ["tags", tag_id, "ff_ids"], a => a.delete(ff_id));
  state = VirtualFileSystem.deriveTags(state);
  return state;
};

const renameTag = (name, tag_id) => state => {
  state = updateIn(state, ["tags", tag_id, "name"], () => name);
  state = VirtualFileSystem.deriveTags(state);
  return state;
};

const deleteTag = tag_id => state => {
  state = state.update("tags", tags => tags.delete(tag_id));
  return state;
};

const writer = {
  set,
  reInit,
  updateAlias,
  updateComments,
  setSessionName,
  createTagged,
  addTagged,
  deleteTagged,
  renameTag,
  deleteTag
};

export default RealEstate.create({
  property_name,
  initialState,
  reader,
  writer
});
