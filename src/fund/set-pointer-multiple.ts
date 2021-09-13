import {
  getWinningPointer,
  setWebMonetizationPointer,
  getPoolWeightSum,
  setCurrentPointer,
  hasAddress,
  isValidWeightSyntax,
} from "./utils";
import { calculateRelativeWeight } from "./relative-weight";
import {
  addressNotFound,
  addressIsNotAString,
  WebfundingError,
  invalidWeight,
  invalidMetadataPointerAddress,
} from "./errors";
import { isBrowser } from "./fund-browser";

export const DEFAULT_WEIGHT: number = 5;

// TODO check pointer.address with RegEx
export function setPointerMultiple(
  pointers: (string | WMPointer)[],
  options: fundOptions = {},
): returnValidPointer {
  let pool: WMPointer[] = createPool(pointers);
  pool = calculateRelativeWeight(pool);
  const pickedPointer = pickPointer(pool);
  const pointerAddress = getPointerAddress(pickedPointer);
  setCurrentPointer(pool);

  if (isBrowser(options)) {
    return setWebMonetizationPointer(pointerAddress, options);
  }

  return pointerAddress;
}

export function getPointerAddress(pointer: WMPointer): string {
  const address = pointer.address;

  if (!address) {
    throw WebfundingError(addressNotFound);
  } else if (typeof address !== "string") {
    throw WebfundingError(addressIsNotAString);
  }
  return address;
}

export function createPool(pointers: Array<string | WMPointer | [WMPointer, any]>): WMPointer[] {
  return pointers.map((pointer: any) => {
    let wmPointer: WMPointer;
    let metadata: any = {};
    if (Array.isArray(pointer)) {
      if (pointer.length > 2) throw WebfundingError(invalidMetadataPointerAddress(pointer));
      if (typeof pointer[1] !== "object")
        throw WebfundingError(invalidMetadataPointerAddress(pointer));
      metadata = { ...pointer[1] } as Object;
      pointer = pointer[0];
    } else if (typeof pointer === "object") {
      metadata = JSON.parse(JSON.stringify(pointer));
      // metadata = { ...pointer };
      if (metadata.address) delete metadata.address;
      if (metadata.weight) delete metadata.weight;
    }
    if (typeof pointer === "string") pointer = convertToPointer(pointer);
    if (!hasAddress(pointer)) throw WebfundingError(addressNotFound);
    wmPointer = checkWeight(pointer);
    return { ...wmPointer, ...metadata };
  });
}

// TODO update checkWeight to use relative weight instead
export function checkWeight(pointer: WMPointer): WMPointer {
  if (pointer.weight === undefined || pointer.weight === NaN) {
    // if (window) console.warn(weightIsNotANumber(pointer.address));
    pointer.weight = DEFAULT_WEIGHT;
  }

  if (!isValidWeightSyntax(pointer.weight.toString())) {
    throw WebfundingError(invalidWeight(pointer.address, pointer.weight));
  }

  return pointer;
}

export function pickPointer(pointers: WMPointer[]): WMPointer {
  const sum = getPoolWeightSum(pointers);
  let choice: number = getChoice(sum);

  return getWinningPointer(pointers, choice);
}

export function getChoice(sum: number): number {
  return Math.random() * sum;
}

export function convertToPointer(str: string): WMPointer {
  let address: string = str;
  let weight!: weight;
  const split: string[] = str.split("#");

  if (split.length > 1) {
    address = split[0];
    weight = split[1];
  }

  const pointer: WMPointer = {
    address,
    weight,
  };

  return checkWeight(pointer);
}
