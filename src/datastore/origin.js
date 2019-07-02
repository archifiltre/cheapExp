import * as Arbitrary from "test/arbitrary";
import { OriginFileElem } from "datastore/origin-file-elem";

const empty = () => {
  return [];
};

const push = (elem, a) => {
  a.push(elem);
};

const arbitrary = () => {
  const a = empty();
  const length = Arbitrary.index() + 1;

  const elemIsCompatibleWithPrevElems = (elem, a) => {
    return a.reduce(
      (acc, val) => acc && OriginFileElem.canBeOnTheSameFileSystem(val, elem),
      true
    );
  }

  while (a.length < length) {
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

  toJs,
  fromJs,
}

