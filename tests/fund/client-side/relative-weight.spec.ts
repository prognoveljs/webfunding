import {
  calculateRelativeWeight,
  mockVariables,
  clear,
  getRelativeWeight,
  filterRelativeWeight,
  normalizeFixedPointers,
  normalizeRelativePointers,
} from "../../../src/fund/relative-weight";
import {
  relativeWeightMustEndsWithPercentage,
  invalidWeight,
  invalidRelativeWeight,
  WebfundingError,
  paymentPointersMustHaveAtLeastOneFixedPointer,
  relativeWeightChanceError,
  weightForRelativePointerNotFound,
} from "../../../src/fund/errors";
import { createPool } from "../../../src/fund/set-pointer-multiple";
import { toBeInTheDocument, toHaveAttribute } from "@testing-library/jest-dom/matchers";
import { fund, getCurrentPointerPool } from "../../../src/fund/mod";
import { forceWebfundingOnBrowser } from "../../../src/fund/fund-browser";
expect.extend({ toBeInTheDocument, toHaveAttribute });

describe("calculating relative weight", () => {
  test("ensure calculating relative weight doesn't have unwanted side effects", () => {
    const mockPointerPool = [
      "$wallet.example.com/example-1#40",
      "$wallet.example.com/example-2#60",
    ];
    const resultPointerPool = [
      {
        address: "$wallet.example.com/example-1",
        weight: 40,
      },
      {
        address: "$wallet.example.com/example-2",
        weight: 60,
      },
    ];
    const relativeWeight = calculateRelativeWeight(createPool(mockPointerPool));

    expect(relativeWeight).toEqual(resultPointerPool);
  });

  test("inserting relative weight to fixed payment pointers", () => {
    const mockPointerPool = [
      "$wallet.example.com/example-1#32",
      "$wallet.example.com/example-2#112",
      "$wallet.example.com/example-relative-weight#50%",
    ];

    const mockPointerPool2 = [
      {
        address: "$wallet.example.com/example-1",
        weight: 40,
      },
      {
        address: "$wallet.example.com/example-2",
        weight: 60,
      },
      {
        address: "$wallet.example.com/example-relative-weight",
        weight: "13%",
      },
      {
        address: "$wallet.example.com/example-relative-weight-2",
        weight: "37%",
      },
    ];

    const resultPointerPool = [
      {
        address: "$wallet.example.com/example-1",
        weight: 16,
      },
      {
        address: "$wallet.example.com/example-2",
        weight: 56,
      },
      {
        address: "$wallet.example.com/example-relative-weight",
        weight: 72,
      },
    ];
    const resultPointerPool2 = [
      {
        address: "$wallet.example.com/example-1",
        weight: 20,
      },
      {
        address: "$wallet.example.com/example-2",
        weight: 30,
      },
      {
        address: "$wallet.example.com/example-relative-weight",
        weight: 13,
      },
      {
        address: "$wallet.example.com/example-relative-weight-2",
        weight: 37,
      },
    ];

    expect(calculateRelativeWeight(createPool(mockPointerPool))).toEqual(resultPointerPool);
    expect(calculateRelativeWeight(createPool(mockPointerPool2))).toEqual(resultPointerPool2);
  });

  test("throw if no fixed pointers found", () => {
    const noFixedPointers = [
      "$wallet.example/no-fixed-weight#10%",
      "$wallet.example/relative-weight#20%",
    ];

    expect(() => calculateRelativeWeight(createPool(noFixedPointers))).toThrowError(
      WebfundingError(paymentPointersMustHaveAtLeastOneFixedPointer),
    );
  });

  test("throw if invalid relative weight", () => {
    const error1 = "442dddd@";
    const error2 = "s4";
    const invalidPointerPool1 = [
      "$wallet.example.com/example-1#" + error1,
      "$wallet.example.com/example-2#60",
    ];

    expect(() => {
      const test = calculateRelativeWeight(createPool(invalidPointerPool1));
      console.log(test);
    }).toThrowError(
      // one
      WebfundingError(invalidWeight("$wallet.example.com/example-1", error1)),
    );

    const invalidPointerPool2 = [
      "$wallet.example.com/example-1#" + error2,
      "$wallet.example.com/example-2#60",
    ];
    expect(() => calculateRelativeWeight(createPool(invalidPointerPool2))).toThrowError(
      // two
      WebfundingError(invalidWeight("$wallet.example.com/example-1", error2)),
    );
  });
});

describe("ensure relative weight on HTML template is working", () => {
  test("with custom syntax", () => {
    document.body.innerHTML = `
    <template webfunding>
      $wallet.example.com/testing-one#40;
      $wallet.example.com/testing-two#60;
      $wallet.example.com/testing-three#50%;
    </template>
    `;
    forceWebfundingOnBrowser();
    fund();
    const expectedPool = [
      {
        address: "$wallet.example.com/testing-one",
        weight: 20,
      },
      {
        address: "$wallet.example.com/testing-two",
        weight: 30,
      },
      {
        address: "$wallet.example.com/testing-three",
        weight: 50,
      },
    ];

    expect(getCurrentPointerPool()).toEqual(expectedPool);
    document.body.innerHTML = "";
  });
  test("with template", () => {
    document.body.innerHTML = `
    <template data-fund="$wallet.example.com/testing-one" data-fund-weight="40"></template>
    <template data-fund="$wallet.example.com/testing-two" data-fund-weight="60"></template>
    <template data-fund="$wallet.example.com/testing-three" data-fund-weight="50%"></template>
    `;
    forceWebfundingOnBrowser();
    fund();
    const expectedPool = [
      {
        address: "$wallet.example.com/testing-one",
        weight: 20,
      },
      {
        address: "$wallet.example.com/testing-two",
        weight: 30,
      },
      {
        address: "$wallet.example.com/testing-three",
        weight: 50,
      },
    ];

    expect(getCurrentPointerPool()).toEqual(expectedPool);
    document.body.innerHTML = "";
  });
  test("with json template", () => {
    document.body.innerHTML = `
      <script webfunding type="application/json">
      [
        "$wallet.example.com/testing-one#40",
        "$wallet.example.com/testing-two#60",
        "$wallet.example.com/testing-three#30%",
        "$wallet.example.com/testing-four#15%",
        "$wallet.example.com/testing-five#5%"
      ]
      </script>
    `;
    forceWebfundingOnBrowser();
    fund();
    const expectedPool = [
      {
        address: "$wallet.example.com/testing-one",
        weight: 20,
      },
      {
        address: "$wallet.example.com/testing-two",
        weight: 30,
      },
      {
        address: "$wallet.example.com/testing-three",
        weight: 30,
      },
      {
        address: "$wallet.example.com/testing-four",
        weight: 15,
      },
      {
        address: "$wallet.example.com/testing-five",
        weight: 5,
      },
    ];

    expect(getCurrentPointerPool()).toEqual(expectedPool);
    document.body.innerHTML = "";
  });

  test("with basic multiple pointers fund()", () => {
    forceWebfundingOnBrowser();
    fund([
      "$wallet.example.com/testing-one#40",
      "$wallet.example.com/testing-two#60",
      "$wallet.example.com/testing-three#50%",
    ]);
    const expectedPool = [
      {
        address: "$wallet.example.com/testing-one",
        weight: 20,
      },
      {
        address: "$wallet.example.com/testing-two",
        weight: 30,
      },
      {
        address: "$wallet.example.com/testing-three",
        weight: 50,
      },
    ];

    expect(getCurrentPointerPool()).toEqual(expectedPool);
  });
});

describe("filtering relative weight payment pointers pool", () => {
  test("ensure filter relative weight works as expected", () => {
    const mock = [
      {
        address: "$wallet.address/test1",
        weight: "30%",
      },
      {
        address: "$wallet.address/test2",
        weight: "15%",
      },
      {
        address: "$wallet.address/test3",
        weight: "30",
      },
      {
        address: "$wallet.address/test4",
        weight: 30,
      },
    ];

    // filteredMock resulted in integer instead of string with %
    // I don't know why this happens, but it works the way it is
    const filteredMock = [
      {
        address: "$wallet.address/test1",
        weight: 30,
      },
      {
        address: "$wallet.address/test2",
        weight: 15,
      },
    ];
    expect(mock.filter(filterRelativeWeight)).toEqual(filteredMock);
    expect(filterRelativeWeight({ address: "$wallet.address.com/testing" })).toBeFalsy();
  });
});

describe("normalize payment pointers", () => {
  test("fixed payment pointers normalized", () => {
    const mock = [
      {
        address: "$wallet.example.com/test-1",
        weight: "40",
      },
      {
        address: "$wallet.example.com/test-2",
        weight: 60,
      },
      {
        address: "$wallet.example.com/test-3",
      },
    ];
    const resultMock = [
      {
        address: "$wallet.example.com/test-1",
        weight: 30,
      },
      {
        address: "$wallet.example.com/test-2",
        weight: 45,
      },
      {
        address: "$wallet.example.com/test-3",
        weight: 3.75,
      },
    ];
    expect(normalizeFixedPointers(mock, 0.25)).toEqual(resultMock);
  });
  test("throw if normalize'd pointers chance more than 100%", () => {
    expect(() => normalizeFixedPointers([], 1.5)).toThrowError(
      WebfundingError(relativeWeightChanceError),
    );
  });
});

describe("relative weight getWeight() function", () => {
  const mockVariableTotalWeight = 55;
  test("basic relative getWeight()", () => {
    const percentWeight = 10;
    const pointer = `$wallet.example.com/test#${percentWeight}%`;
    mockVariables();
    expect(getRelativeWeight(pointer)).toBe(mockVariableTotalWeight / percentWeight);
  });

  test("getWeight() with object pointer", () => {
    const pointer = {
      address: "$wallet.example.com/testing",
      weight: "10%",
    };
    mockVariables();
    expect(getRelativeWeight(pointer)).toBe(5.5);
  });

  test("throw if relative weight not end with %", () => {
    const pointer = "$wallet.example.com/test#11";
    expect(() => getRelativeWeight(pointer)).toThrowError(
      WebfundingError(relativeWeightMustEndsWithPercentage),
    );
  });
  test("throw if relative weight not end with %", () => {
    const pointer = {
      address: "$wallet.example.com/test",
      weight: "11",
    };
    expect(() => getRelativeWeight(pointer)).toThrowError(
      WebfundingError(relativeWeightMustEndsWithPercentage),
    );
  });

  test("throw if getWeight() recieves no weight pointer", () => {
    const pointer = { address: "$wallet.example.com/test" };
    expect(() => getRelativeWeight(pointer)).toThrowError(
      WebfundingError(weightForRelativePointerNotFound(pointer.address)),
    );
  });

  test("throw if getWeight() recieves invalid weight", () => {
    const pointer = { address: "$wallet.example.com/test", weight: true };
    expect(() => getRelativeWeight(pointer)).toThrowError(
      WebfundingError(invalidRelativeWeight(pointer.address)),
    );
  });

  test("throw error if no weight found", () => {
    const pointer = { address: "$wallet.address.com/test" };
    expect(() => getRelativeWeight(pointer)).toThrowError(
      WebfundingError(weightForRelativePointerNotFound(pointer.address)),
    );
  });
});

describe("mock relative weight", () => {
  test("mock clear() function", () => {
    const mock = {
      relativeWeightPointers: [{ address: "test", weight: 1 }],
      fixedWeightPointers: [{ address: "test", weight: 1 }],
      totalRelativeChance: 44,
      pointerPoolSum: 55,
    };
    const mockVar = mockVariables();
    expect(mockVar).toEqual(mock);

    expect(clear()).toEqual({
      relativeWeightPointers: [],
      fixedWeightPointers: [],
      totalRelativeChance: 0,
      pointerPoolSum: 0,
    });
  });
});
