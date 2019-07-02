import { Record, Set } from "immutable";

const accessors = (name) => {
  const get = (a) => a.get(name);
  const set = (b, a) => a.set(name, b);
  const update = (f, a) => set(f(get(a)), a);
  return [get, set, update];
}

const [getName, setName] = accessors("name");
const [getFfIds, setFfIds, updateFfIds] = accessors("ff_ids");

const [getSize, setSize] = accessors("size");


const recordFactory = Record({
  name: "",
  ff_ids: Set(),

  size: 0,
});

const empty = () => {
  return recordFactory();
};

const create = (name, ff_ids) => {
  let a = empty();

  a = setName(name, a);
  a = setFfIds(ff_ids, a);

  return a;
};


const toJs = (a) => {
  return {
    name: getName(a),
    ff_ids: getFfIds(a).toArray(),

    size: getSize(a),
  }
}

const fromJs = (a) => {
  let ans = empty();

  ans = setName(a.name, ans);
  ans = setFfIds(a.ff_ids, ans);

  ans = setSize(a.size, ans);

  return ans;
}

export const Tag = {
  create,
  toJs,
  fromJs,

  getName,
  
  getFfIds,
  setFfIds,
  updateFfIds,

  getSize,
  setSize,

}



