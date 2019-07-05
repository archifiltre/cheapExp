import chai from "chai";
const expect = chai.expect;

import { Quickcheck } from "test/quickcheck";
import { NormalizedPosixPath } from "datastore/normalized-posix-path";


describe("normalized-posix-path", () => {
  Quickcheck.loop("toPlatformDependentPath . fromPlatformDependentPath == identity", () => {
    NormalizedPosixPath.setPlatformToPosix();
    const folder = NormalizedPosixPath.arbitraryPosixPath();
    const file = NormalizedPosixPath.arbitraryPosixPath();

    expect(
      NormalizedPosixPath.toPlatformDependentPath(
        folder,
        NormalizedPosixPath.fromPlatformDependentPath(
          folder,
          folder + "/" + file
        )
      )
    ).to.equal(
      folder + "/" + file
    );

    NormalizedPosixPath.setPlatformToHost();
  });

  Quickcheck.loop("fromNameArray . toNameArray == identity", () => {
    const a = NormalizedPosixPath.arbitrary();

    expect(
      NormalizedPosixPath.fromNameArray(NormalizedPosixPath.toNameArray(a))
    ).to.equal(
      a
    );
  });


  const test = (setPlatform, folder_path, file_path, npp_ans, name_array_ans) => {
    it("dropped path : "+folder_path+" elem path : "+file_path, () => {
      setPlatform();
      const npp = NormalizedPosixPath.fromPlatformDependentPath(
        folder_path,
        file_path
      );
      expect(npp).to.equal(npp_ans);
      const name_array = NormalizedPosixPath.toNameArray(npp);
      expect(name_array).to.deep.equal(name_array_ans);
      expect(NormalizedPosixPath.fromNameArray(name_array)).to.equal(npp);
      expect(
        NormalizedPosixPath.toPlatformDependentPath(
          folder_path,
          npp
        )
      ).to.equal(file_path);
      NormalizedPosixPath.setPlatformToHost();
    });
  };

  describe("posix path tests", () => {
    test(
      NormalizedPosixPath.setPlatformToPosix,
      "/path/to/my/folder",
      "/path/to/my/folder/my/cool/file",
      "/folder/my/cool/file",
      ["", "folder", "my", "cool", "file"]
    );
    test(
      NormalizedPosixPath.setPlatformToPosix,
      "/path/to/my/folder",
      "/path/to/my/folder",
      "/folder",
      ["", "folder"]
    );
    test(
      NormalizedPosixPath.setPlatformToPosix,
      "/folder",
      "/folder/my/cool/file",
      "/folder/my/cool/file",
      ["", "folder", "my", "cool", "file"]
    );
    test(
      NormalizedPosixPath.setPlatformToPosix,
      "/folder",
      "/folder",
      "/folder",
      ["", "folder"]
    );
    test(
      NormalizedPosixPath.setPlatformToPosix,
      "/",
      "/my/cool/file",
      "/my/cool/file",
      ["", "my", "cool", "file"]
    );
    test(
      NormalizedPosixPath.setPlatformToPosix,
      "/",
      "/",
      "",
      [""]
    );
  });

  describe("windows path tests", () => {
    test(
      NormalizedPosixPath.setPlatformToWin32,
      "C:\\path\\to\\my\\folder",
      "C:\\path\\to\\my\\folder\\my\\cool\\file",
      "/folder/my/cool/file",
      ["", "folder", "my", "cool", "file"]
    );
    test(
      NormalizedPosixPath.setPlatformToWin32,
      "C:\\path\\to\\my\\folder",
      "C:\\path\\to\\my\\folder",
      "/folder",
      ["", "folder"]
    );
    test(
      NormalizedPosixPath.setPlatformToWin32,
      "C:\\folder",
      "C:\\folder\\my\\cool\\file",
      "/folder/my/cool/file",
      ["", "folder", "my", "cool", "file"]
    );
    test(
      NormalizedPosixPath.setPlatformToWin32,
      "C:\\folder",
      "C:\\folder",
      "/folder",
      ["", "folder"]
    );
    test(
      NormalizedPosixPath.setPlatformToWin32,
      "C:\\",
      "C:\\my\\cool\\file",
      "/my/cool/file",
      ["", "my", "cool", "file"]
    );
    test(
      NormalizedPosixPath.setPlatformToWin32,
      "C:\\",
      "C:\\",
      "",
      [""]
    );
  });




});
