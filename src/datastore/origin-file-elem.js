import * as Arbitrary from "test/arbitrary";


const setSize = (size, a) => a[0].size = size
const getSize = (a) => a[0].size

const setLastModified = (last_modified, a) => a[0].last_modified = last_modified
const getLastModified = (a) => a[0].last_modified

const setPath = (path, a) => a[1] = path
const getPath = (a) => a[1]

const empty = () => {
  const a = [{}, undefined]

  setSize(0, a);
  setLastModified(0, a);
  setPath("/", a);

  return a;
};

const create = (size, last_modified, path) => {
  const a = empty();

  setSize(size, a);
  setLastModified(last_modified, a);
  setPath(path, a);

  return a;
};

const arbitrary = () => {
  const arbitraryPath = () => {
    const index = () => Arbitrary.index() + 1;
    const value = () => "level"+Math.floor(Math.random() * 5);
    return "/" + Arbitrary.arrayWithIndex(index)(value).join("/");
  };

  const a = empty();

  setSize(Arbitrary.natural(), a);
  setLastModified(Arbitrary.natural(), a);
  setPath(arbitraryPath(), a);

  return a;
};

const canBeOnTheSameFileSystem = (a,b) => {
  const a_path = getPath(a);
  const b_path = getPath(b);

  // Each OriginFileElem represent a file in a file system
  // /a/b and /a/b/d can not be on the same file system
  if (a_path.length < b_path.length) {
    return a_path !== b_path.slice(0, a_path.length);
  } else {
    return b_path !== a_path.slice(0, b_path.length);
  }
}

const compare = (a,b) => {
  const a_path = getPath(a);
  const b_path = getPath(b);

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
  compare,
  getPath,
  getSize,
  getLastModified,
}

