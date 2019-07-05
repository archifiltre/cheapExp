import { updateIn, getIn, List, Set } from "immutable";

import * as RealEstate from "reducers/real-estate";

import * as Cache from "cache";
import { Origin } from "datastore/origin";
import { VirtualFileSystem } from "datastore/virtual-file-system";
import { FilesAndFolders } from "datastore/files-and-folders";
import { Tags } from "datastore/tags";
import { Tag } from "datastore/tag";
import { FileOrFolder } from "datastore/file-or-folder";


import * as SEDA from "seda";



const property_name = "database";

const initialState = () => VirtualFileSystem.make(Origin.empty());

const overallCount = () => state => {
  const ffs = VirtualFileSystem.getFilesAndFolders(state);
  return FilesAndFolders.numberOfFileOrFolder(ffs);
};

const fileCount = () => state => {
  const ffs = VirtualFileSystem.getFilesAndFolders(state);

  return FilesAndFolders.numberOfFile(ffs);
}

const getFfByFfId = id => state => {
  const ffs = VirtualFileSystem.getFilesAndFolders(state);
  return FilesAndFolders.getById(id, ffs);
}
const rootFfId = () => state => FilesAndFolders.rootId();

const maxDepth = () => state => {
  const ffs = VirtualFileSystem.getFilesAndFolders(state);
  return FilesAndFolders.maxDepth(ffs);
}

const volume = () => state => {
  const ffs = VirtualFileSystem.getFilesAndFolders(state);
  return FilesAndFolders.totalSize(ffs);
}

const getFfIdPath = id => state => {
  const ffs = VirtualFileSystem.getFilesAndFolders(state);
  return FilesAndFolders.idToParentIdArray(id, ffs);
}

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

  return Tags.getIdArrayByFfId(id, tags);
}
const getAllTagIds = () => state => {
  const tags = VirtualFileSystem.getTags(state);

  return Tags.toIdArray(tags);
}

const getTagByTagId = id => state => {
  const tags = VirtualFileSystem.getTags(state);
  return Tags.getById(id, tags);
}


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
};

const set = next_state => state => next_state;

const reInit = () => state => initialState();

const updateAlias = (updater, id) => state => {
  return VirtualFileSystem.updateFilesAndFolders(
    ffs => FilesAndFolders.updateById(
      id,
      elem => FileOrFolder.updateAlias(updater, elem),
      ffs
    ),
    state
  );
};

const updateComments = (updater, id) => state => {
  return VirtualFileSystem.updateFilesAndFolders(
    ffs => FilesAndFolders.updateById(
      id,
      elem => FileOrFolder.updateComments(updater, elem),
      ffs
    ),
    state
  );
};

const setSessionName = name => state => {
  return VirtualFileSystem.setSessionName(name, state);
}

const createTagged = (ff_id, name) => state => {
  state = VirtualFileSystem.updateTags(
    tags => Tags.push(Tag.create(name, Set.of(ff_id)), tags),
    state
  );

  state = VirtualFileSystem.deriveTags(state);
  return state;
};

const updateTagFfIds = (tag_id, updater, state) => {
  return VirtualFileSystem.updateTags(
    tags => Tags.updateById(
      tag_id,
      tag => Tag.updateFfIds(updater, tag),
      tags
    ),
    state
  );
}

const addTagged = (ff_id, tag_id) => state => {
  state = updateTagFfIds(tag_id, a => a.add(ff_id), state);
  state = VirtualFileSystem.deriveTags(state);
  return state;
};

const deleteTagged = (ff_id, tag_id) => state => {
  state = updateTagFfIds(tag_id, a => a.delete(ff_id), state);
  state = VirtualFileSystem.deriveTags(state);
  return state;
};

const renameTag = (name, tag_id) => state => {
  state = VirtualFileSystem.updateTags(
    tags => Tags.updateById(
      tag_id,
      tag => Tag.setName(name, tag),
      tags
    ),
    state
  )
  state = VirtualFileSystem.deriveTags(state);
  return state;
};

const deleteTag = tag_id => state => {
  state = VirtualFileSystem.updateTags(
    tags => Tags.deleteById(tag_id, tags),
    state
  )
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
