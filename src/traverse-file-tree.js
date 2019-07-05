const Fs = require("fs");
const Path = require("path");

import { OriginFileElem } from "datastore/origin-file-elem";
import { NormalizedPosixPath } from "datastore/normalized-posix-path";
import { Origin } from "datastore/origin";

const recTraverseFileTree = (hook, dropped_folder_path, path, origin) => {
  try {
    const stats = Fs.statSync(path);
    if (stats.isDirectory()) {
      Fs.readdirSync(path)
        .forEach(a =>
          recTraverseFileTree(hook, dropped_folder_path, Path.join(path, a), origin)
        )
    } else {
      hook();


      const npp = NormalizedPosixPath.fromPlatformDependentPath(
        dropped_folder_path,
        path
      );

      const elem = OriginFileElem.create(
        stats.size,
        stats.mtimeMs,
        npp
      );

      Origin.push(elem, origin);
    }
  } catch (e) {
    
  }
};

export const traverseFileTree = (hook, dropped_folder_path) => {
  let origin = Origin.empty();

  recTraverseFileTree(
    hook,
    dropped_folder_path,
    dropped_folder_path,
    origin
  );

  return [dropped_folder_path, origin];
};

export function isJsonFile(path) {
  const stats = Fs.statSync(path);
  return stats.isFile() && Path.extname(path) === ".json";
}

export const readFileSync = Fs.readFileSync;

