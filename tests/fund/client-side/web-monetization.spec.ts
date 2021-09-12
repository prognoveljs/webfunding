import { getCurrentPointerPool, WebMonetization } from "../../../src/fund/mod";
import { forceWebfundingOnBrowser } from "../../../src/fund/fund-browser";
import { toBeInTheDocument, toHaveAttribute } from "@testing-library/jest-dom/matchers";
expect.extend({ toBeInTheDocument, toHaveAttribute });

describe("setup web monetzation class", () => {
  it("pointer with metadata", (done) => {
    const pointers = [
      [
        "$wallet.com/example-1#20",
        {
          name: "Hallo",
        },
      ],
      "$wallet.com/example-2#40",
      "$wallet.com/example-3#10",
    ];

    const result = [
      {
        address: "$wallet.com/example-1",
        weight: 20,
        name: "Hallo",
      },
      {
        address: "$wallet.com/example-2",
        weight: 40,
      },
      {
        address: "$wallet.com/example-3",
        weight: 10,
      },
    ];

    forceWebfundingOnBrowser();
    let wm;
    try {
      wm = new WebMonetization().registerPaymentPointers(pointers).start();
    } catch (error) {
      throw error;
    }

    wm.queue
      .then(() => {
        expect(getCurrentPointerPool()).toEqual(result);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});
