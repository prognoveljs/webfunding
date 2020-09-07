import { fund } from "../../../src/fund/mod";
import { forceFundmeOnBrowser } from "../../../src/fund/fund-browser";
import {
  noTemplateFound,
  jsonTemplateIsInvalid,
  cannotParseScriptJson,
  failParsingTemplate,
  WebfundingError,
} from "../../../src/fund/errors";

describe("test scraping template crashes resulting right throw errors", () => {
  test("fund() is called but no template is found", () => {
    document.body.innerHTML = "";
    forceFundmeOnBrowser();
    expect(() => fund()).toThrowError(WebfundingError(noTemplateFound));
    document.body.innerHTML = "";
  });

  test("found <script webfunding> but it's not an array", () => {
    document.body.innerHTML = `
      <script webfunding type="application/json">
        {
          "address": "$coil.com/my-test",
          "weight": 6
        }
      </script>
    `;
    forceFundmeOnBrowser();
    expect(() => fund()).toThrowError(WebfundingError(jsonTemplateIsInvalid));
    document.body.innerHTML = "";
  });

  test("found <script webfunding> but it's not a valid JSON", () => {
    document.body.innerHTML = `
      <script webfunding type="application/json">
        $coil.com/test-@@
      </script>
    `;
    forceFundmeOnBrowser();
    expect(() => fund()).toThrowError(WebfundingError(cannotParseScriptJson));
    document.body.innerHTML = "";
  });

  // parse template errors
  test("fails to parse address from <template data-fund></template>", () => {
    document.body.innerHTML = `
      <template data-fund="" />
    `;
    function fundThrow() {
      forceFundmeOnBrowser();
      fund();
    }
    expect(fundThrow).toThrowError(WebfundingError(failParsingTemplate));
    document.body.innerHTML = "";
  });
});
