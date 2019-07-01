const Fs = require("fs");
const Path = require("path");

import { OriginFileElem } from "datastore/origin-file-elem";
import { Origin } from "datastore/origin";

const recTraverseFileTree = (hook, dropped_dirname, path, origin) => {
  try {
    const stats = Fs.statSync(path);
    if (stats.isDirectory()) {
      Fs.readdirSync(path)
        .forEach(a =>
          recTraverseFileTree(hook, dropped_dirname, Path.join(path, a), origin)
        )
    } else {
      hook();

      const elem = OriginFileElem.create(
        stats.size,
        stats.mtimeMs,
        convertToPosixPath(path.slice(dropped_dirname.length))
      );

      Origin.push(elem, origin);
    }
  } catch (e) {
    
  }
};

const convertToPosixPath = path => path.split(Path.sep).join("/");

export const traverseFileTree = (hook, dropped_folder_path) => {
  let origin = Origin.empty();

  const dropped_dirname = Path.dirname(dropped_folder_path);

  recTraverseFileTree(
    hook,
    dropped_dirname,
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

