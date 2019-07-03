


const loop = (str, f, timeout = 4000) => {
  it(str, () => {
    Array(100).fill().forEach(() => f());
  }).timeout(timeout);
}

export const Quickcheck = {
  loop,
}

