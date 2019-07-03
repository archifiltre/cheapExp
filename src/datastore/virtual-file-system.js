import version from "version";

import { FilesAndFolders } from "datastore/files-and-folders";
import { Tags } from "datastore/tags";
import { Record } from "immutable";

if (isNaN(version) || typeof version !== "number") {
  throw new Error("version is not a number");
}

const accessors = (name) => {
  const get = (a) => a.get(name);
  const set = (b, a) => a.set(name, b);
  const update = (f, a) => set(f(get(a)), a);
  return [get, set, update];
}

const [getSessionName, setSessionName] = accessors("session_name");
const [getOriginalPath, setOriginalPath] = accessors("original_path");
const [getVersion, setVersion] = accessors("version");
const [
  getFilesAndFolders,
  setFilesAndFolders,
  updateFilesAndFolders
] = accessors("files_and_folders");
const [getTags, setTags, updateTags] = accessors("tags");

const recordFactory = Record({
  session_name: "Untitled",
  original_path: "",
  version,
  files_and_folders: FilesAndFolders.empty(),
  tags: Tags.empty()
});




const empty = () => {
  return recordFactory();
};


const toJs = (a) => {
  return {
    session_name: getSessionName(a),
    original_path: getOriginalPath(a),
    version: getVersion(a),
    files_and_folders: FilesAndFolders.toJs(getFilesAndFolders(a)),
    tags: Tags.toJs(getTags(a)),
  }
}

const fromJs = (a) => {
  let ans = empty();

  ans = setSessionName(a.session_name, ans);
  ans = setOriginalPath(a.original_path, ans);
  ans = setVersion(a.version, ans);
  ans = setFilesAndFolders(FilesAndFolders.fromJs(a.files_and_folders), ans);
  ans = setTags(Tags.fromJs(a.tags), ans);

  return ans;
}


const make = (origin, path) => {
  let ans = empty();

  ans = setFilesAndFolders(FilesAndFolders.fromOrigin(origin), ans);
  ans = setOriginalPath(path, ans);

  return ans;
}

const deriveTags = (vfs) => {
  const ffs = getFilesAndFolders(vfs);
  vfs = updateTags(tags => Tags.update(ffs, tags), vfs);
  return vfs;
}

const deriveFilesAndFolders = (vfs) => {
  return updateFilesAndFolders(FilesAndFolders.computeDerived, vfs);
}

const derive = (vfs) => {
  return deriveTags(deriveFilesAndFolders(vfs));
}

export const VirtualFileSystem = {
  getSessionName,
  setSessionName,

  getOriginalPath,
  getFilesAndFolders,
  updateFilesAndFolders,

  getTags,
  updateTags,

  toJs,
  fromJs,

  make,
  derive,
  deriveTags,
}





