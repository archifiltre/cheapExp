import chai from "chai";
const expect = chai.expect;

import { Quickcheck } from "test/quickcheck";
import * as Arbitrary from "test/arbitrary";
import { CSV } from "csv";

describe("csv", function() {
  const arbitraryBool = () => Math.random() <= 0.5
  Quickcheck.loop("(line2List . list2Line) a", () => {
    const a = Arbitrary.immutableList(Arbitrary.string);
    const withDoubleQuote = true;

    expect(
      CSV.line2List(CSV.list2Line(withDoubleQuote)(a))
    ).to.deep.equal(
      a
    );
  });

  Quickcheck.loop("(fromStr . toStr) a", () => {
    const a = CSV.arbitrary();
    const withDoubleQuote = true;

    expect(
      CSV.fromStr(CSV.toStr(withDoubleQuote)(a)).toJS()
    ).to.deep.equal(
      a.toJS()
    )
  });

  it("leftPadInt", () => {
    expect(CSV.leftPadInt(0, 12)).to.equal("12");
    expect(CSV.leftPadInt(1, 12)).to.equal("12");
    expect(CSV.leftPadInt(2, 12)).to.equal("12");
    expect(CSV.leftPadInt(3, 12)).to.equal("012");
    expect(CSV.leftPadInt(4, 12)).to.equal("0012");
  });

  Quickcheck.loop("epochToFormatedUtcDateString", () => {
    // month : 1971 <-> 2071
    const random_year = 1971 + Math.floor(Math.random() * 100);
    // month : 0 <-> 11
    const zero_based_random_month = Math.round(Math.random() * 11);
    const random_month = zero_based_random_month + 1;
    // day : 1 <-> 27
    const random_day = 1 + Math.floor(Math.random() * 26);

    const random_epoch = Date.UTC(random_year, zero_based_random_month, random_day);

    expect(
      CSV.epochToFormatedUtcDateString(random_epoch)
    ).to.equal(
      CSV.leftPadInt(2, random_day) + "/" +
      CSV.leftPadInt(2, random_month) + "/" +
      CSV.leftPadInt(4, random_year)
    )
  });
});
