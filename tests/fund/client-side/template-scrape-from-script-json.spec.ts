import { fund, getCurrentPointerPool } from "../../../src/fund/mod";
import { forceWebfundingOnBrowser } from "../../../src/fund/fund-browser";
import { toBeInTheDocument, toHaveAttribute } from "@testing-library/jest-dom/matchers";
import { scriptWebfundingIsNotApplicationJson } from "../../../src/fund/errors";

expect.extend({ toBeInTheDocument, toHaveAttribute });

describe("parsing webfunding template from a JSON array", () => {
  test('fund() will scrape from <script webfunding type="application/json">', () => {
    document.body.innerHTML = `
    <script webfunding type="application/json">
    [
      "$coil.xrptipbot.com/my-pointer",
      {
        "address": "$xrp.com/tip-my-content",
        "weight": 8
      }
    ]
    </script>
    `;
    forceWebfundingOnBrowser();
    fund();
    const pool = getCurrentPointerPool();
    // @ts-ignore
    expect(pool[0].address).toBe("$coil.xrptipbot.com/my-pointer");
    document.body.innerHTML = "";
  });
  test("<script webfunding> accepts single string", () => {
    document.body.innerHTML = `
      <script webfunding type="application/json">
        "$coil.xrptipbot.com/my-pointer"
      </script>
    `;
    forceWebfundingOnBrowser();
    fund();
    const pool = getCurrentPointerPool();
    // @ts-ignore
    expect(pool[0].address).toBe("$coil.xrptipbot.com/my-pointer");
    document.body.innerHTML = "";
  });

  test('<script webfunding> must have MIME type "application/json"', () => {
    // const pointerAddress = '$coil.com/pointer-address1'
    document.body.innerHTML = `
      <script webfunding>
        [
          "$coil.com/my-pointer",
          {
            "address": "$xrp.com/tip-my-content",
            "weight": 8
          }
        ]
      </script>
    `;
    forceWebfundingOnBrowser();
    // @ts-ignore
    expect(() => fund()).toThrowError(scriptWebfundingIsNotApplicationJson);
    document.body.innerHTML = "";
  });
});
