


const loop = (str, f) => {
  it(str, () => {
    Array(100).fill().forEach(() => f());
  });
}

export const Quickcheck = {
  loop,
}

