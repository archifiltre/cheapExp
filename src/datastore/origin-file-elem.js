import * as Arbitrary from "test/arbitrary";
import { NormalizedPosixPath } from "datastore/normalized-posix-path";


const setSize = (size, a) => a.size = size
const getSize = (a) => a.size

const setLastModified = (last_modified, a) => a.last_modified = last_modified
const getLastModified = (a) => a.last_modified

const setNormalizedPosixPath = (path, a) => a.path = path
const getNormalizedPosixPath = (a) => a.path

const empty = () => {
  const a = {};

  setSize(0, a);
  setLastModified(0, a);
  setNormalizedPosixPath("/", a);

  return a;
};

const create = (size, last_modified, path) => {
  const a = empty();

  setSize(size, a);
  setLastModified(last_modified, a);
  setNormalizedPosixPath(path, a);

  return a;
};

const arbitrary = () => {
  const a = empty();

  setSize(Arbitrary.natural(), a);
  setLastModified(Arbitrary.natural(), a);
  setNormalizedPosixPath(NormalizedPosixPath.arbitrary(), a);

  return a;
};

const canBeOnTheSameFileSystem = (a,b) => {
  const a_path = getNormalizedPosixPath(a);
  const b_path = getNormalizedPosixPath(b);

  // Each OriginFileElem represent a file in a file system
  // "/a/b" and "/a/b/d" file path can not be on the same file system
  if (a_path.length < b_path.length) {
    return a_path !== b_path.slice(0, a_path.length);
  } else {
    return b_path !== a_path.slice(0, b_path.length);
  }
};

const comparePath = (a,b) => {
  const a_path = getNormalizedPosixPath(a);
  const b_path = getNormalizedPosixPath(b);

  if (a_path < b_path) {
    return -1;
  } else if (a_path === b_path) {
    return 0;
  } else {
    return 1;
  }
}


export const OriginFileElem = {
  arbitrary,
  canBeOnTheSameFileSystem,
  create,
  comparePath,
  getNormalizedPosixPath,
  getSize,
  getLastModified,
}

