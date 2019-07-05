import * as Arbitrary from "test/arbitrary";

const Path = require("path");
const PathWin32 = Path.win32;
const PathPosix = Path.posix;

let getPath = () => {
  return Path
};

let setPlatformToHost = () => {};
let setPlatformToWin32 = () => {};
let setPlatformToPosix = () => {};
if (process && process.env && process.env.TEST) {
  setPlatformToHost = () => {
    getPath = () => Path;
  };
  setPlatformToWin32 = () => {
    getPath = () => PathWin32;
  };
  setPlatformToPosix = () => {
    getPath = () => PathPosix;
  };
}

//=====================//
// NormalizedPosixPath //
//=====================//

// A normalized posix path is a path following this pattern :
// /droppedFolderName/path/to/my/file.txt
// where
//   droppedFolderName is the folder dropped in archifiltre
//
// A normalized posix path always start with a '/' except for the root path
// The root normalized posix path is "".
// When convert to a name array, it become :
// ["", "droppedFolderName", "path", "to", "my", "file.txt"]

const empty = () => "";

const arbitrary = () => {
  const index = () => Arbitrary.index() + 1;
  const value = () => "level"+Math.floor(Math.random() * 5);
  return "/" + Arbitrary.arrayWithIndex(index)(value).join("/");
}

const arbitraryPosixPath = () => {
  const index = () => Arbitrary.index() + 1;
  return Arbitrary.arrayWithIndex(index)(Arbitrary.string).join("/");
}

const isRootPath = a => {
  const parse = getPath().parse(a);
  return parse.root === parse.dir + parse.name;
};

const fromPlatformDependentPath = (
  platform_dependent_dropped_path,
  platform_dependent_path
) => {
  const convertToPosixPath = path => path.split(getPath().sep).join("/");
  const slice_len = platform_dependent_dropped_path.length;
  const posix_path = convertToPosixPath(
    platform_dependent_path.slice(slice_len)
  );

  const dropped_name = getPath().basename(platform_dependent_dropped_path);

  if (isRootPath(platform_dependent_path)) {
    return "";
  } else {
    return "/" + dropped_name + posix_path;
  }
};

const toPlatformDependentPath = (
  platform_dependent_dropped_path,
  normalized_posix_path
) => {
  const isTheDroppedFolderPath = a => {
    return toNameArray(a).length === 2;
  };
  const convertToPlatformPath = a => a.split("/").join(getPath().sep);
  const removeFolderNameFromPath = a => fromNameArray(toNameArray(a).slice(2));
  const removeRootNameFromPath = a => fromNameArray(toNameArray(a).slice(1));

  if (isRootPath(platform_dependent_dropped_path)) {
    normalized_posix_path = removeRootNameFromPath(normalized_posix_path);
    return (
      platform_dependent_dropped_path +
      convertToPlatformPath(normalized_posix_path)
    );
  } else if (isTheDroppedFolderPath(normalized_posix_path)) {
    return (
      platform_dependent_dropped_path
    );
  } else {
    normalized_posix_path = removeFolderNameFromPath(normalized_posix_path);
    return (
      platform_dependent_dropped_path +
      getPath().sep +
      convertToPlatformPath(normalized_posix_path)
    );
  }

}

const toNameArray = (a) => {
  return a.split("/");
}

const fromNameArray = (a) => {
  return a.join("/");
}

export const NormalizedPosixPath = {
  empty,
  arbitrary,
  arbitraryPosixPath,

  fromPlatformDependentPath,
  toPlatformDependentPath,

  toNameArray,
  fromNameArray,

  setPlatformToHost,
  setPlatformToWin32,
  setPlatformToPosix,
}
