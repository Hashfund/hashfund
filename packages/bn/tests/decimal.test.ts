import { safeBN, unsafeBnToNumber } from "../src";

const APP_SUPPORTED_PERCISION = 6;

test("Should maintain decimals", () => {
  const target = 39078.002345;

  const number = unsafeBnToNumber(
    safeBN(target, APP_SUPPORTED_PERCISION),
    APP_SUPPORTED_PERCISION
  );

  console.log(number);

  expect(number).toBe(target);
});

test("whole number should work", () => {
  const target = 12345;
  const number = unsafeBnToNumber(
    safeBN(target, APP_SUPPORTED_PERCISION),
    APP_SUPPORTED_PERCISION
  );

  expect(number).toBe(target);
});
