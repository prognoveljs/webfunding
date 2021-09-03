import { setupDynamicRevshare } from "./dynamic-revshare";
import { fund } from "./fund";
import { convertToPointer } from "./set-pointer-multiple";

export class WebMonetization {
  public currentPool: WMPointer[] = [];
  receiptVerifierServiceEndpoint: string = "$webmonetization.org/api/receipts/";
  private options: any;
  private affiliatePointer = {
    affiliate: "affiliate",
    affiliateName: "affiliate-name",
    affiliateId: "affiliate-id",
  };
  constructor(opts?: any) {
    this.options = opts;
    return this;
  }

  set(pointers: WMPointer | WMPointer[]): this {
    this.currentPool = Array.isArray(pointers) ? pointers : [pointers];

    return this;
  }

  add(pointers: WMPointer | WMPointer[]): this {
    return this.registerPaymentPointers(pointers);
  }

  registerPaymentPointers(pointers: WMPointer | WMPointer[]): this {
    if (!Array.isArray(pointers)) pointers = [pointers];
    this.currentPool = [...this.currentPool, ...pointers];

    return this;
  }

  registerAffiliateReferrer(id: string): this {
    const dynamicRevshare = setupDynamicRevshare(id);

    const { affiliate } = dynamicRevshare.syncRoute();
    this.registerPaymentPointers(convertToPointer(affiliate));

    return this;
  }

  start(): this {
    try {
      fund(this.currentPool, this.options);
    } catch (error) {
      console.warn(error);
    }

    return this;
  }

  reset(): this {
    this.start();

    return this;
  }
}
