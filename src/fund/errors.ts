import { DEFAULT_WEIGHT } from "./set-pointer-multiple";

export function WebfundingError(err: string): string {
  return "Webfunding.js: " + err;
}

export const addressNotFound = "address not found.";
export const addressIsNotAString = "address must be a string.";
export const getCurrentPointerAddressMustClientSide =
  "can't use getCurrentPointerAddress() server-side.";
export const weightNotFound = "entries .weight not found.";
export function weightIsNotANumber(str: string) {
  return `${str} has weight that is not a number. It has been set to ${DEFAULT_WEIGHT} (default).`;
}
export const invalidAddress = "invalid Web Monetization pointer address is given.";
export const invalidMetadataPointerAddress = (pointer: any) => {
  return `invalid pointer with metadata in ${pointer}`;
};

// multiple pointers
export const getWinningPointerMustBeANumber =
  "all pointers' weight during calculating a winning pointer must have type of number.";

// default address
export const defaultAddressNotFound =
  "default address not found. Use setDefaultAddress(str: string) to set it first.";
export const invalidDefaultAddress = "invalid default address.";
export const defaultAddressArrayCannotBeEmpty = "invalid default address.";
// utils
export const canOnlyCleanStringCustomSyntax = "can only clean custom syntax with typeof string.";

// about meta tag for Web Monetization API
export const metaTagNotFound = "web monetization meta tag is not found.";
export const metaTagMultipleIsFound =
  'multiple <meta name="monetization" /> found - Web Monetization API only support a single meta tag.';

// pointers template
export const noTemplateFound = "no monetization template is found.";
export const failParsingTemplate = "fails to parse address from <template data-fund></template>.";
export const templateSinglePointerHasWeight =
  "found single <template data-fund></template> but has weight - only address will be parsed.";

// script json template
export const cannotParseScriptJson =
  "cannot parse JSON from <script webfunding>. Make sure it contains a valid JSON.";
export const jsonTemplateIsInvalid = "found <script webfunding> but it's not valid.";
export const scriptWebfundingIsNotApplicationJson =
  'found <script webfunding> but its type is not "application/json"';

// relative weight
export const paymentPointersMustHaveAtLeastOneFixedPointer =
  "revenue sharing payment pointers must have at least one payment address pointer with fixed weight.";
export const relativeWeightChanceError =
  "error when calculating total relative weight chance. Make sure it's a float between 0~1.0.";
export const weightForRelativePointerNotFound = (address: string | WMPointer) => {
  return `payment pointer weights not found for ${address}`;
};
export const relativeWeightMustEndsWithPercentage = "relative weights must end with character %.";
export const invalidRelativeWeight = (address: string) => {
  return `relative weight for payment pointer ${address} must be integer or float.`;
};
export const invalidWeight = (address: string, weight: string | number | undefined) => {
  return `weight for payment pointer ${address}#${weight} is invalid.`;
};

// split fund
export const splitFundError = `must set web monetization pointer address with fund() before split.`;

// stats
export const getStatsPercentageErrorPointerIsUndefined = `get revshare stats failed to get payment pointer percentage stats. Pointer is invalid or undefined.`;
export const getStatsPercentageErrorWeightIsUndefined = `get revshare stats failed to get payment pointer percentage stats. Weight is invalid or undefined.`;
export const getStatsPercentageErrorGettingCurrentPool = `get revshare stats failed to get current payment pointer pool.`;
export const getStatsPercentageErrorCalculatingWeightSum = `get revshare stats failed to calculate payment pointer chance sum.`;
export const getStatsPercentageErrorCalculatingRelativeWeight = `get revshare stats failed to calculate relative weight.`;
export const getStatsPercentageErrorPickingAddress = `get revshare stats failed when picking address in pointer pool array.`;

/*****************************
 *                           *
 *  Server-side fund()       *
 *                           *
 *****************************/
export const noUndefinedFundOnServerSide = "can't use fund() with empty parameters in server side.";
export const invalidWebfundingServerSide = "invalid webfunding on the server-side.";
