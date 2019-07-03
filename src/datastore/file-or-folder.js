import { Record, List } from "immutable";
import * as Arbitrary from "test/arbitrary";
import { generateRandomString } from "random-gen";

const accessors = (name) => {
  const get = (a) => a.get(name);
  const set = (b, a) => a.set(name, b);
  const update = (f, a) => set(f(get(a)), a);
  return [get, set, update];
}

const [getName, setName] = accessors("name");
const [getAlias, setAlias, updateAlias] = accessors("alias");
const [getComments, setComments, updateComments] = accessors("comments");
const [getChildren, setChildren] = accessors("children");
const pushToChildren = (id, a) => {
  return setChildren(getChildren(a).push(id), a);
};
const [getParent, setParent] = accessors("parent");

const [getFileSize, setFileSize] = accessors("file_size");
const [getFileLastModified, setFileLastModified] = accessors("file_last_modified");


const [getSize, setSize] = accessors("size");
const [getLastModifiedMax, setLastModifiedMax] = accessors("last_modified_max");
const [getLastModifiedList, setLastModifiedList] = accessors("last_modified_list");
const [getLastModifiedMin, setLastModifiedMin] = accessors("last_modified_min");
const [getLastModifiedMedian, setLastModifiedMedian] = accessors("last_modified_median");
const [getLastModifiedAverage, setLastModifiedAverage] = accessors("last_modified_average");
const [getDepth, setDepth] = accessors("depth");
const [getNbFiles, setNbFiles] = accessors("nb_files");
const [getSortBySizeIndex, setSortBySizeIndex] = accessors("sort_by_size_index");
const [getSortByDateIndex, setSortByDateIndex] = accessors("sort_by_date_index");


const recordFactory = Record({
  name: "",
  alias: "",
  comments: "",
  children: List(),
  parent: null,
  file_size: 0,
  file_last_modified: 0,


  size: 0,
  last_modified_max: 0,
  last_modified_list: List(),
  last_modified_min: Number.MAX_SAFE_INTEGER,
  last_modified_median: null,
  last_modified_average: null,
  depth: 0,
  nb_files: 0,
  sort_by_size_index: List(),
  sort_by_date_index: List(),
});






const empty = () => {
  return recordFactory();
};

const create = (name, parent_id) => {
  let a = empty();

  a = setName(name, a);
  a = setParent(parent_id, a);

  return a;
};

const arbitrary = () => {
  let a = empty();

  a = FileOrFolder.setName(generateRandomString(40), a);
  a = FileOrFolder.setAlias(Arbitrary.string(), a);
  a = FileOrFolder.setComments(Arbitrary.string(), a);

  a = FileOrFolder.setFileSize(Arbitrary.natural(), a);
  a = FileOrFolder.setFileLastModified(Arbitrary.natural(), a);

  return a;
}

const reinitDerivedData = (a) => {
  a = setSize(0, a);
  a = setLastModifiedMax(0, a);
  a = setLastModifiedList(List(), a);
  a = setLastModifiedMin(Number.MAX_SAFE_INTEGER, a);
  a = setLastModifiedMedian(null, a);
  a = setLastModifiedAverage(null, a);
  a = setDepth(0, a);
  a = setNbFiles(0, a);
  a = setSortBySizeIndex(List(), a);
  a = setSortByDateIndex(List(), a);

  return a;
}

const toJs = (a) => {
  return {
    name: getName(a),
    alias: getAlias(a),
    comments: getComments(a),
    children: getChildren(a).toArray(),
    parent: getParent(a),
    file_size: getFileSize(a),
    file_last_modified: getFileLastModified(a),

    size: getSize(a),
    last_modified_max: getLastModifiedMax(a),
    last_modified_list: getLastModifiedList(a).toArray(),
    last_modified_min: getLastModifiedMin(a),
    last_modified_median: getLastModifiedMedian(a),
    last_modified_average: getLastModifiedAverage(a),
    depth: getDepth(a),
    nb_files: getNbFiles(a),
    sort_by_size_index: getSortBySizeIndex(a).toArray(),
    sort_by_date_index: getSortByDateIndex(a).toArray(),
  }
}

const fromJs = (a) => {
  let ans = empty();

  ans = setName(a.name, ans);
  ans = setAlias(a.alias, ans);
  ans = setComments(a.comments, ans);
  ans = setChildren(List(a.children), ans);
  ans = setParent(a.parent, ans);
  ans = setFileSize(a.file_size, ans);
  ans = setFileLastModified(a.file_last_modified, ans);

  ans = setSize(a.size, ans);
  ans = setLastModifiedMax(a.last_modified_max, ans);
  ans = setLastModifiedList(List(a.last_modified_list), ans);
  ans = setLastModifiedMin(a.last_modified_min, ans);
  ans = setLastModifiedMedian(a.last_modified_median, ans);
  ans = setLastModifiedAverage(a.last_modified_average, ans);
  ans = setDepth(a.depth, ans);
  ans = setNbFiles(a.nb_files, ans);
  ans = setSortBySizeIndex(List(a.sort_by_size_index), ans);
  ans = setSortByDateIndex(List(a.sort_by_date_index), ans);

  return ans;
}


export const FileOrFolder = {
  empty,
  create,

  arbitrary,

  toJs,
  fromJs,

  reinitDerivedData,

  getName,
  setName,
  
  getChildren,
  pushToChildren,

  getParent,
  setParent,

  setFileSize,
  getFileSize,

  setFileLastModified,
  getFileLastModified,

  setAlias,
  getAlias,
  updateAlias,
  
  setComments,
  getComments,
  updateComments,

  setDepth,
  getDepth,
  
  setSize,
  getSize,

  setLastModifiedMin,
  getLastModifiedMin,

  setLastModifiedAverage,
  getLastModifiedAverage,

  setLastModifiedMedian,
  getLastModifiedMedian,

  setLastModifiedMax,
  getLastModifiedMax,

  setLastModifiedList,
  getLastModifiedList,

  setNbFiles,
  getNbFiles,

  setSortBySizeIndex,
  getSortBySizeIndex,

  setSortByDateIndex,
  getSortByDateIndex,
}
