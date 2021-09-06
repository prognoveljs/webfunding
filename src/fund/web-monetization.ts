import { setupDynamicRevshare } from "./dynamic-revshare";
import { fund } from "./fund";
import { convertToPointer } from "./set-pointer-multiple";

export class WebMonetization<IWebMonetization> {
  static PUBLIC_RECEIPT_VERIFIER_SERVICE = "$webmonetization.org/api/receipts/";
  public currentPool: WMAddress = [];
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

  set(pointers: WMAddress): this {
    if (Array.isArray(pointers)) {
      this.currentPool = pointers;
    } else if (pointers) {
      this.currentPool = [pointers];
    }

    return this;
  }

  add(pointers: WMAddress): this {
    return this.registerPaymentPointers(pointers);
  }

  registerPaymentPointers(pointers: WMAddress): this {
    if (!Array.isArray(pointers) && pointers) pointers = [pointers];
    this.currentPool = [...(this.currentPool || []), ...(pointers || [])];

    return this;
  }

  async asyncRegisterAffiliateReferrer(id: string, weight: string | number = "10%"): Promise<this> {
    const dynamicRevshare = setupDynamicRevshare(id);

    const { affiliate } = await dynamicRevshare.syncRoute();
    if (affiliate) this.registerPaymentPointers(`${convertToPointer(affiliate).address}#${weight}`);

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
