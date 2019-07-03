import * as Arbitrary from "test/arbitrary";
import { OriginFileElem } from "datastore/origin-file-elem";

const empty = () => {
  return [];
};

const push = (elem, a) => {
  a.push(elem);
};

const length = (a) => {
  return a.length;
};

const totalSize = (a) => {
  return a.reduce((acc, val) => acc + OriginFileElem.getSize(val), 0);
}

const maxDepth = (a) => {
  return a.reduce((acc, val) =>
    Math.max(acc, OriginFileElem.getPath(val).split("/").length - 1),
    0
  );
}

const arbitrary = () => {
  const a = empty();
  const length = Math.floor(Math.random() * 100);

  const elemIsCompatibleWithPrevElems = (elem, a) => {
    return a.reduce(
      (acc, val) => acc && OriginFileElem.canBeOnTheSameFileSystem(val, elem),
      true
    );
  }

  for (let i = 0; i < length; i++) {
    const origin_file_elem = OriginFileElem.arbitrary();

    if (elemIsCompatibleWithPrevElems(origin_file_elem, a)) {
      push(origin_file_elem, a);
    };
  }

  return a;
};

const sort = (a) => {
  a.sort(OriginFileElem.comparePath);
  return a;
};

const forEach = (callback, a) => {
  a.forEach(callback);
};

const toJs = (a) => {
  return a;
}

const fromJs = (a) => {
  return a;
}

export const Origin = {
  empty,
  push,
  sort,
  forEach,
  arbitrary,

  totalSize,
  maxDepth,
  length,

  toJs,
  fromJs,
}

