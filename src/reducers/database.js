import { updateIn, getIn, List, Set } from "immutable";

import * as RealEstate from "reducers/real-estate";

import * as Cache from "cache";
import * as Origin from "datastore/origin";
import * as VirtualFileSystem from "datastore/virtual-file-system";
import * as FilesAndFolders from "datastore/files-and-folders";
import * as Tags from "datastore/tags";


import * as SEDA from "seda";



const property_name = "database";

const initialState = () => VirtualFileSystem.make(Origin.empty());

const overallCount = () => state => state.get("files_and_folders").size;

const fileCount = () => state =>
  state.get("files_and_folders").filter(a => a.get("children").size === 0).size;

const getFfByFfId = id => state => state.get("files_and_folders").get(id);
const rootFfId = () => state => "";

const maxDepth = () => state =>
  state
    .get("files_and_folders")
    .map(a => a.get("depth"))
    .reduce((acc, val) => Math.max(acc, val), 0);

const volume = () => state => getFfByFfId(rootFfId()())(state).get("size");

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
  const files_and_folders = state.get("files_and_folders");
  const root_id = FilesAndFolders.getFfRootId();
  const ff_id_list = FilesAndFolders.toFfidList(files_and_folders).filter(a=>a!=root_id);
  const tags = state.get("tags");

  const ans = FilesAndFolders.toStrList2(ff_id_list, files_and_folders);

  Tags.toStrList2(ff_id_list, files_and_folders, tags).forEach((a,i) => {
    ans[i] = ans[i].concat(a);
  });

  return ans;
};

const toSIP = () => SEDA.makeSIP;

const getSessionName = () => state => state.get("session_name");
const getOriginalPath = () => state => state.get("original_path");

const getTagIdsByFfId = id => state =>
  state
    .get("tags")
    .filter(tag => tag.get("ff_ids").includes(id))
    .keySeq()
    .toList();
const getAllTagIds = () => state =>
  state
    .get("tags")
    .keySeq()
    .toList();

const getTagByTagId = id => state => getIn(state, ["tags", id]);

const getWaitingCounter = () => state => 0;

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
  getWaitingCounter
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
  state = VirtualFileSystem.derivateTags(state);
  return state;
};

const addTagged = (ff_id, tag_id) => state => {
  state = updateIn(state, ["tags", tag_id, "ff_ids"], a => a.add(ff_id));
  state = VirtualFileSystem.derivateTags(state);
  return state;
};

const deleteTagged = (ff_id, tag_id) => state => {
  state = updateIn(state, ["tags", tag_id, "ff_ids"], a => a.delete(ff_id));
  state = VirtualFileSystem.derivateTags(state);
  return state;
};

const renameTag = (name, tag_id) => state => {
  state = updateIn(state, ["tags", tag_id, "name"], () => name);
  state = VirtualFileSystem.derivateTags(state);
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
