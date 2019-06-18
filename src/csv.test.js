import chai from "chai";
const should = chai.should();

import * as Loop from "test/loop";
import * as Arbitrary from "test/arbitrary";
import { CSV } from "csv";

describe("csv", function() {
  const arbitraryBool = () => Math.random() <= 0.5
  Loop.equal("(line2List . list2Line) a", () => {
    const a = Arbitrary.immutableList(Arbitrary.string);
    const withDoubleQuote = true;
    return [CSV.line2List(CSV.list2Line(withDoubleQuote)(a)), a];
  });

  Loop.equal("(fromStr . toStr) a", () => {
    const a = CSV.arbitrary();
    const withDoubleQuote = true;
    return [CSV.fromStr(CSV.toStr(withDoubleQuote)(a)).toJS(), a.toJS()];
  });

  it("leftPadInt", () => {
    CSV.leftPadInt(0, 12).should.equal("12");
    CSV.leftPadInt(1, 12).should.equal("12");
    CSV.leftPadInt(2, 12).should.equal("12");
    CSV.leftPadInt(3, 12).should.equal("012");
    CSV.leftPadInt(4, 12).should.equal("0012");
  });

  Loop.equal("epochToFormatedUtcDateString", () => {
    // month : 1971 <-> 2071
    const random_year = 1971 + Math.floor(Math.random() * 100);
    // month : 0 <-> 11
    const zero_based_random_month = Math.round(Math.random() * 11);
    const random_month = zero_based_random_month + 1;
    // day : 1 <-> 27
    const random_day = 1 + Math.floor(Math.random() * 26);

    const random_epoch = Date.UTC(random_year, zero_based_random_month, random_day);

    return [
      CSV.epochToFormatedUtcDateString(random_epoch),
      (
        CSV.leftPadInt(2, random_day) + "/" +
        CSV.leftPadInt(2, random_month) + "/" +
        CSV.leftPadInt(4, random_year)
      )
    ];
  });
});
