import version from "version";

import * as ObjectUtil from "util/object-util";
import * as FilesAndFolders from "datastore/files-and-folders";
import * as Tags from "datastore/tags";
import { Record } from "immutable";

if (isNaN(version) || typeof version !== "number") {
  throw new Error("version is not a number");
}


const virtualFileSystem = Record({
  session_name: "Untitled",
  original_path: "",
  version,
  files_and_folders: FilesAndFolders.empty(),
  tags: Tags.empty()
});

export const toJs = (a) => {
  return {
    session_name: a.get("session_name"),
    original_path: a.get("original_path"),
    version: a.get("version"),
    files_and_folders: FilesAndFolders.toJs(a.get("files_and_folders")),
    tags: Tags.toJs(a.get("tags"))
  }
};

export const fromJs = (a) => {
  return virtualFileSystem({
    session_name: a.session_name,
    original_path: a.original_path,
    version: a.version,
    files_and_folders: FilesAndFolders.fromJs(a.files_and_folders),
    tags: Tags.fromJs(a.tags)
  });
};


export const make = (origin, path) =>
  virtualFileSystem({
    files_and_folders: FilesAndFolders.ff(origin),
    original_path: path
  });

export const derivateTags = vfs =>
  vfs.update("tags", tags => Tags.update(vfs.get("files_and_folders"), tags));

export const derivateFilesAndFolders = vfs =>
  vfs.update("files_and_folders", FilesAndFolders.computeDerived);

export const derivate = vfs => derivateTags(derivateFilesAndFolders(vfs));


