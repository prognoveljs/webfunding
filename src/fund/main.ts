import { createPool } from './set-pointer-multiple'
import { metaTagNotFound, metaTagMultipleIsFound } from './errors'
import { clientSideFund } from './main-client'
import { serverSideFund, isServer } from './main-server'

export let defaultAddress: WMAddress
export let currentPointer: WMAddress
export let currentFundType: FundType

export enum FundType {
  isSingle = 'single',
  isMultiple = 'multiple',
  isDefault = 'default',
  isFromTemplate = 'template',
  isUndefined = 'undefined',
}

export const isBrowser = this.window === this

export function fund(pointer?: WMAddress, options?: fundOptions): FundType | string {
  if (isBrowser) {
    return clientSideFund()
  } else {
    if (isServer() && pointer === null) {
      throw new Error("Can't use fund() with empty parameters in server side.")
    } else {
      return serverSideFund(pointer)
    }
  }
}

export function setDefaultAddress(address: WMAddress): void {
  if (Array.isArray(address)) {
    defaultAddress = createPool(address)
  } else {
    defaultAddress = address
  }
}

export function setCurrentPointer(pointer: string | WMPointer[]) {
  currentPointer = pointer
}

export function setFundType(type: FundType): FundType {
  currentFundType = type

  return currentFundType
}

export function getCurrentPointerAddress(): string {
  const metaTag: NodeListOf<HTMLMetaElement> = document.head.querySelectorAll('meta[name="monetization"]')

  if (metaTag.length > 1) {
    throw new Error(metaTagMultipleIsFound)
  }

  if (metaTag[0]) {
    return metaTag[0].content
  }

  throw new Error(metaTagNotFound)
}

export function getCurrentPointerPool(): Array<string | WMPointer> {
  let pointer = currentPointer

  return convertToPointerPool(pointer)
}

export function convertToPointerPool(pointer: WMAddress): Array<string | WMPointer> {
  if (!Array.isArray(pointer)) {
    pointer = [pointer]
  }

  return pointer
}
