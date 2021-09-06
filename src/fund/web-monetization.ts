import { setupDynamicRevshare } from "./dynamic-revshare";
import { fund } from "./fund";
import { convertToPointer } from "./set-pointer-multiple";

export class WebMonetization<IWebMonetization> {
  static PUBLIC_RECEIPT_VERIFIER_SERVICE = "$webmonetization.org/api/receipts/";
  public currentPool: WMPointer[] = [];
  private options: WebMonetizationOptions = {
    receiptVerifierService: "",
    receiptVerifierServerProxy: "",
  };
  private affiliatePointer = {
    affiliate: "affiliate",
    affiliateName: "affiliate-name",
    affiliateId: "affiliate-id",
  };
  constructor(opts?: WebMonetizationOptions) {
    this.options.receiptVerifierService = opts?.receiptVerifierService || "";
    this.options.receiptVerifierServerProxy = opts?.receiptVerifierServerProxy || "";

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

  useReceiptVerifier(verify?: ReceiptVerifier): this {
    this.options.receiptVerifierService = verify?.receiptVerifierService || "";
    this.options.receiptVerifierServerProxy = verify?.receiptVerifierServerProxy || "";

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
