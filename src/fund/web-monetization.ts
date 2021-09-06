import { setupDynamicRevshare } from "./dynamic-revshare";
import { fund } from "./fund";
import { convertToPointer } from "./set-pointer-multiple";

export class WebMonetization {
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
  queue: Promise<any>;
  constructor(opts?: WebMonetizationOptions) {
    this.options.receiptVerifierService = opts?.receiptVerifierService || "";
    this.options.receiptVerifierServerProxy = opts?.receiptVerifierServerProxy || "";

    this.queue = Promise.resolve() as Promise<any>;
    return this;
  }

  then(callback: Function) {
    callback(this.queue);
  }

  private chain(callback: any) {
    return (this.queue = this.queue.then(callback));
  }

  private add(pointers: WMAddress): this {
    if (!Array.isArray(pointers) && pointers) pointers = [pointers];
    this.currentPool = [...(this.currentPool || []), ...(pointers || [])];

    return this;
  }

  registerPaymentPointers(pointers: WMAddress): this {
    this.chain(() => {
      this.add(pointers);
    });

    return this;
  }

  registerAffiliateReferrer(id: string, weight: string | number = "10%"): this {
    this.chain(async () => {
      const dynamicRevshare = setupDynamicRevshare(id);

      console.log("idb started");
      const { affiliate } = await dynamicRevshare.syncRoute();
      console.log("idb finish");
      if (affiliate) this.add(`${convertToPointer(affiliate).address}#${weight}`);

      return;
    });

    return this;
  }

  useReceiptVerifier(verify?: ReceiptVerifier): this {
    this.chain(() => {
      this.options.receiptVerifierService = verify?.receiptVerifierService || "";
      this.options.receiptVerifierServerProxy = verify?.receiptVerifierServerProxy || "";
    });

    return this;
  }

  start(): this {
    this.chain(() => {
      console.log("chain started");
      try {
        fund(this.currentPool, this.options);
      } catch (error) {
        console.warn(error);
      }
    });

    console.log("start()");
    return this;
  }

  reset(): this {
    this.chain(() => {
      this.start();
    });

    return this;
  }
}
