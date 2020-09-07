import { isMultiplePointer } from "./utils";
import { setPointerMultiple } from "./set-pointer-multiple";
import {
  WebfundingError,
  invalidWebfundingServerSide,
  noUndefinedFundOnServerSide,
} from "./errors";
import { setPointerSingle } from "./set-pointer-single";

export function serverSideFund(pointer: WMAddress): string {
  if (pointer === null || pointer === undefined) throw WebfundingError(noUndefinedFundOnServerSide);

  if (typeof pointer === "string") {
    return setPointerSingle(pointer).toString();
  }

  if (isMultiplePointer(pointer)) {
    return setPointerMultiple(pointer).toString();
  }

  throw WebfundingError(invalidWebfundingServerSide);
}
