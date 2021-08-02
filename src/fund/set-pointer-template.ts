import {
  checkWeight,
  setPointerMultiple,
  DEFAULT_WEIGHT,
  createPool,
  convertToPointer,
} from "./set-pointer-multiple";
import {
  noTemplateFound,
  failParsingTemplate,
  scriptWebfundingIsNotApplicationJson,
  cannotParseScriptJson,
  jsonTemplateIsInvalid,
  WebfundingError,
} from "./errors";

export const WEBFUNDING_TEMPLATE_SELECTOR = "template[data-fund]";
export const WEBFUNDING_CUSTOM_SYNTAX_SELECTOR = "template[webfunding]";
export const WEBFUNDING_JSON_SELECTOR = "script[webfunding]";

type JSONTemplate = Array<WMPointer | string>;

export function setPointerFromTemplates(options: fundOptions = {}): void {
  const pointers: Array<WMPointer> = [
    ...scrapeTemplate(),
    ...scrapeJson(),
    ...scrapeCustomSyntax(),
  ];

  if (pointers.length) {
    setPointerMultiple(pointers, options);
  } else {
    throw WebfundingError(noTemplateFound);
  }
}

// DON'T throw errors inside scrape functions if array is found to be empty
// fund() already do that
export function scrapeJson(): WMPointer[] {
  const scriptTags: NodeListOf<HTMLScriptElement> =
    document.body.querySelectorAll(WEBFUNDING_JSON_SELECTOR);
  let pointers: WMPointer[] = [];

  if (scriptTags.length) {
    scriptTags.forEach((json) => {
      pointers = parseScriptJson(json);
    });
  }

  return pointers;
}

function parseScriptJson(json: HTMLScriptElement): WMPointer[] {
  let pointers: WMPointer[] = [];
  let parsed: string | WMPointer[] | Array<string | WMPointer>;

  try {
    parsed = JSON.parse(json.innerHTML);
  } catch (err) {
    throw WebfundingError(cannotParseScriptJson);
  }

  if (json.type !== "application/json") {
    throw WebfundingError(scriptWebfundingIsNotApplicationJson);
  }

  if (Array.isArray(parsed)) {
    pointers = createPool(parsed);
  } else if (typeof parsed === "string") {
    pointers = createPool([parsed]);
  } else {
    throw WebfundingError(jsonTemplateIsInvalid);
  }

  return pointers;
}

export function scrapeTemplate(): WMPointer[] {
  const templates: NodeListOf<HTMLTemplateElement> = document.body.querySelectorAll(
    WEBFUNDING_TEMPLATE_SELECTOR,
  );
  let pointers: WMPointer[] = [];

  if (templates.length) {
    templates.forEach((template) => {
      const pointer: WMPointer = parseTemplate(template);
      pointers = [...pointers, pointer];
    });
  }

  return pointers;
}

export function parseTemplate(template: HTMLTemplateElement): WMPointer {
  let address: string = template.dataset.fund!;
  let weight: weight = template.dataset.fundWeight ?? DEFAULT_WEIGHT;

  if (!address) {
    throw WebfundingError(failParsingTemplate);
  }

  const pointer: WMPointer = checkWeight({
    address,
    weight,
  });

  return pointer;
}

export function scrapeCustomSyntax(): WMPointer[] {
  const templates: NodeListOf<HTMLTemplateElement> = document.querySelectorAll(
    WEBFUNDING_CUSTOM_SYNTAX_SELECTOR,
  );
  let pointers: WMPointer[] = [];

  if (templates.length) {
    templates.forEach((template) => {
      pointers = [...pointers, ...parseCustomSyntax(template)];
    });
  }
  return pointers;
}

export function parseCustomSyntax(template: HTMLTemplateElement): WMPointer[] {
  let pointers: WMPointer[] = [];
  const temp = template.innerHTML;

  temp.split(";").forEach((str) => {
    const strippedString = str.replace(/(^\s+|\s+$)/g, "");
    if (strippedString) {
      pointers = [...pointers, convertToPointer(strippedString)];
    }
  });

  return pointers;
}
