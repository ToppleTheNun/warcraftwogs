import { expect, test } from "vitest";

import { isWithinTolerance } from "~/utils";

test("isWithinTolerance respects tolerance levels", () => {
  // Report tolerance
  expect(
    isWithinTolerance({
      original: 1684458811469,
      toCheck: 1684458809992,
      tolerance: 1500,
    })
  ).toEqual(true);
  expect(
    isWithinTolerance({
      original: 1684458811469,
      toCheck: 1684458809992,
      tolerance: 1400,
    })
  ).toEqual(false);

  // Afterimage tolerance
  expect(
    isWithinTolerance({
      original: 1684458521897 + 378415,
      toCheck: 1684458521897 + 378525,
      tolerance: 750,
    })
  ).toEqual(true);
  expect(
    isWithinTolerance({
      original: 1684458521897 + 378415,
      toCheck: 1684458521897 + 380754,
      tolerance: 750,
    })
  ).toEqual(false);
});
