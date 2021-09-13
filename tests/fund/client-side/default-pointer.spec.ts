import {
  fund,
  setDefaultAddress,
  getCurrentPointerAddress,
  getCurrentPointerPool,
} from "../../../src/fund/mod";
import { forceWebfundingOnBrowser } from "../../../src/fund/fund-browser";
import {
  defaultAddressNotFound,
  invalidDefaultAddress,
  defaultAddressArrayCannotBeEmpty,
  WebfundingError,
} from "../../../src/fund/errors";
import { DEFAULT_WEIGHT } from "../../../src/fund/set-pointer-multiple";
import { getDefaultAddress, defaultAddressMultiple } from "../../../src/fund/utils";

describe("default pointer", () => {
  test("correctly set default pointer for single paramter", () => {
    setDefaultAddress("$wallet.example.com/test1");
    forceWebfundingOnBrowser();
    fund("default");
    expect(getCurrentPointerAddress()).toBe("$wallet.example.com/test1");
  });
  test("correctly set default pointer for single paramter with object", () => {
    setDefaultAddress({ address: "$wallet.example.com/test2" });
    forceWebfundingOnBrowser();
    fund("default");
    expect(getCurrentPointerAddress()).toBe("$wallet.example.com/test2");
  });

  test("set default address with multiple pointers", () => {
    const pointers = [
      "$twitter.com/my-address", //@ts-ignore
      {
        address: "$coil.com/test",
        weight: 6,
      },
      {
        address: "$xrp.com/my-address2",
        weight: 11,
      },
    ];

    setDefaultAddress(pointers);
    const expectedPointers = [
      {
        address: "$twitter.com/my-address",
        weight: DEFAULT_WEIGHT,
      },
      {
        address: "$coil.com/test",
        weight: 6,
      },
      {
        address: "$xrp.com/my-address2",
        weight: 11,
      },
    ];

    forceWebfundingOnBrowser();
    fund("default");
    expect(getCurrentPointerPool()).toEqual(expectedPointers);
  });

  test("default address multiple must be array", () => {
    const pointer = "$wallet.example.com/test";
    const address = defaultAddressMultiple(pointer);

    expect(address).toEqual([pointer]);
    expect(defaultAddressMultiple([pointer])).toEqual([pointer]);
  });

  test("throw if default address not found", () => {
    //@ts-ignore
    expect(() => {
      setDefaultAddress(undefined, { allowUndefined: true }); //@ts-ignore
      fund("default", { force: "client" });
    }).toThrowError(WebfundingError(defaultAddressNotFound));
  });

  test("throw if default address undefined", () => {
    //@ts-ignore
    expect(() => {
      setDefaultAddress(undefined); //@ts-ignore
    }).toThrowError(WebfundingError(invalidDefaultAddress));
  });

  test("throw if default address invalid", () => {
    const set = (any) => {
      setDefaultAddress(any);
    };
    //@ts-ignore
    expect(() => set({})).toThrowError(WebfundingError(invalidDefaultAddress));
    //@ts-ignore
    expect(() => set(4)).toThrowError(WebfundingError(invalidDefaultAddress));
  });
  test("throw if default address is array but empty", () => {
    const set = (any) => {
      setDefaultAddress(any);
    };
    //@ts-ignore
    expect(() => set([])).toThrowError(WebfundingError(defaultAddressArrayCannotBeEmpty));
  });
});
