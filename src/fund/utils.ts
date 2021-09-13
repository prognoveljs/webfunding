import { createPool, getPointerAddress, DEFAULT_WEIGHT } from "./set-pointer-multiple";
import { isBrowser } from "./fund-browser";
import { FundType } from "./fund";
import {
  metaTagNotFound,
  metaTagMultipleIsFound,
  getCurrentPointerAddressMustClientSide,
  WebfundingError,
  canOnlyCleanStringCustomSyntax,
  defaultAddressArrayCannotBeEmpty,
  invalidDefaultAddress,
  getWinningPointerMustBeANumber,
  invalidBiasGroup,
  invalidWeight,
  invalidBiasGroupTotal,
  weightIsNotANumber,
} from "./errors";
import { getReceiptURL } from "./verfier";

export function isMultiplePointer(s: any): boolean {
  return Array.isArray(s);
}

export function setWebMonetizationPointer(address: string, opts?: fundOptions): HTMLMetaElement {
  let wmAddress = document.head.querySelector('meta[name="monetization"]')! as HTMLMetaElement;

  return setWebMonetizationTag(wmAddress, address, opts);
}

export function setWebMonetizationTag(
  wmAddress: HTMLMetaElement,
  address: string,
  opts?: fundOptions,
): HTMLMetaElement {
  if (!wmAddress) {
    wmAddress = createWebMonetizationTag(address, opts);
  } else {
    wmAddress.content = getReceiptURL(address, opts?.receiptVerifierService || "");
  }

  return wmAddress;
}

export function createWebMonetizationTag(address: string, opts?: fundOptions): HTMLMetaElement {
  const wmAddress = document.createElement("meta");
  wmAddress.name = "monetization";
  wmAddress.content = getReceiptURL(address, opts?.receiptVerifierService || "");
  document.head.appendChild(wmAddress);

  return wmAddress;
}

export function getPoolWeightSum(pointers: WMPointer[]): number {
  const weights: weight[] = pointers.map((pointer) => {
    return pointer.weight ?? DEFAULT_WEIGHT; // TODO - safecheck null assertion
  });

  return Object.values(weights).reduce((sum: number, weight: weight): number => {
    if (isNumberOnly(weight)) {
      if (typeof weight === "string") weight = parseFloat(weight);
      return sum + weight;
    } else {
      return sum;
    }
  }, 0);
}

export function getWinningPointer(pointers: WMPointer[], choice: number): WMPointer {
  for (const pointer in pointers) {
    const weight: weight = pointers[pointer].weight ?? DEFAULT_WEIGHT; // TODO - safecheck null assertion

    if (typeof weight !== "number") throw WebfundingError(getWinningPointerMustBeANumber);

    if ((choice -= weight) <= 0) {
      return pointers[pointer];
    }
  }

  // Decide if this will be the default behavior later
  // in case unexpected case where choice is greater than all pointers' weight
  return pointers[0];
}

export function hasAddress(obj: any): boolean {
  if (!obj) return false;

  return Object.keys(obj).some((str) => str === "address");
}

let defaultAddress: defaultAddress;
export function setDefaultAddress(
  address: defaultAddress,
  options: defaultAddressOptions = {},
): void {
  if (Array.isArray(address)) {
    if (address.length) {
      defaultAddress = createPool(address);
      return;
    } else {
      throw WebfundingError(defaultAddressArrayCannotBeEmpty);
    }
  }

  if (typeof address === "string") {
    defaultAddress = address;
    return;
  }

  if (hasAddress(address)) {
    defaultAddress = getPointerAddress(address);
    return;
  }

  if (options.allowUndefined && address === undefined) {
    // @ts-ignore
    defaultAddress = undefined; // TODO check if ts-ignore break things
    return;
  }

  throw WebfundingError(invalidDefaultAddress);
}

export function getDefaultAddress(): defaultAddress {
  return defaultAddress;
}

export function defaultAddressMultiple(address: defaultAddress): any {
  return isMultiplePointer(address) ? address : [address];
}

export let currentFundType: FundType;
export function setFundType(type: FundType): FundType {
  currentFundType = type;

  return currentFundType;
}

export let currentPointer: WMAddress;
export function setCurrentPointer(pointer: string | WMPointer[]) {
  currentPointer = pointer;
}

export function getCurrentPointerAddress(): string {
  // const forced = forceBrowser
  if (isBrowser()) {
    const metaTag: NodeListOf<HTMLMetaElement> = document.head.querySelectorAll(
      'meta[name="monetization"]',
    );

    if (metaTag.length > 1) {
      throw WebfundingError(metaTagMultipleIsFound);
    }

    if (metaTag[0]) {
      return metaTag[0].content;
    }
    throw WebfundingError(metaTagNotFound);
  } else {
    if (currentPointer) return currentPointer.toString();
    throw WebfundingError(getCurrentPointerAddressMustClientSide);
  }
}

export const DEFAULT_BIAS_GROUP = "DEFAULT_BIAS_GROUP";
export function calculateGroupBias(pool: WMPointer[], sum: number, bias: WMBiasGroup): WMPointer[] {
  let result: WMPointer[] = [];
  let default_bias_leftover = 1;
  const pointersGroupPoolSum: {
    [group: string]: number;
  } = {};
  const pointersByGroup = Object.keys(bias).reduce((prev: any, cur: string) => {
    prev[cur] = [...(prev[cur] || []), ...pool.filter((pointer) => pointer.biasGroup === cur)];
    pool = pool.filter((pointer) => pointer.biasGroup !== cur);
    if (typeof bias[cur] === "string") {
      if (!isValidWeightSyntax(bias[cur]) || (bias[cur] as string).slice(-1) !== "%") {
        throw WebfundingError(invalidBiasGroup(cur));
      }
      bias[cur] = parseFloat(bias[cur] as string) / 100;
    }

    try {
      default_bias_leftover -= bias[cur] as number;
    } catch (err) {
      throw WebfundingError(invalidBiasGroup(cur));
    }

    return prev;
  }, {});

  if (default_bias_leftover < 0) throw WebfundingError(invalidBiasGroupTotal);
  if (pool.length) {
    pointersByGroup[DEFAULT_BIAS_GROUP] = pool;
    bias[DEFAULT_BIAS_GROUP] = default_bias_leftover;
    pool.forEach((pointer) => (pointer.biasGroup = DEFAULT_BIAS_GROUP));
  }

  for (const key in pointersByGroup) {
    pointersByGroup[key].forEach((pointer: WMPointer) => {
      if (typeof pointer.weight !== "number")
        throw WebfundingError(weightIsNotANumber("a pointer during bias calculation"));
      pointersGroupPoolSum[key] = (pointersGroupPoolSum[key] || 0) + pointer.weight;
    });

    const rate = bias[key] as number;
    const intendedGroupSum = sum * rate;

    pointersByGroup[key].forEach((pointer: WMPointer) => {
      pointer.weight = (intendedGroupSum / pointersGroupPoolSum[key]) * (pointer.weight as number);
      result = [...result, pointer];
    });
  }

  return result;
}

export function cleanSinglePointerSyntax(pointer: any): any {
  if (typeof pointer === "string") {
    pointer = pointer.split("#")[0];
  } else {
    throw WebfundingError(canOnlyCleanStringCustomSyntax);
  }

  return pointer;
}

export function getCurrentPointerPool(): Array<string | WMPointer> {
  let pointer = currentPointer;

  return convertToPointerPool(pointer);
}

export function convertToPointerPool(pointer: WMAddress): Array<string | WMPointer> {
  if (!Array.isArray(pointer) && pointer !== undefined) {
    pointer = [pointer];
  }

  return pointer || [];
}

export function isNumberOnly(text: unknown): boolean {
  if (typeof text === "string") {
    const regex = /^[0-9]*$/;

    return regex.test(text);
  }

  return typeof text === "number";
}

export function isValidWeightSyntax(text: unknown): boolean {
  if (typeof text === "string") {
    const regex = /^\d*\.?\d*%?$/gm;

    return regex.test(text);
  }

  return typeof text === "number";
}
