type WMAddress = string | Array<string | WMPointer> | undefined;
type returnValidPointer = string | HTMLMetaElement;
type defaultAddress = string | WMPointer | (string | WMPointer)[];
type address = string;
type weight = number | string;

interface WMPointer {
  address: string;
  weight?: weight;
  biasGroup?: string;
}

interface WMPointerStats {
  address: string;
  chance: number;
}

interface fundOptions extends ReceiptVerifier {
  force?: "client" | "server";
  maxPool?: number;
  default?: boolean;
  affiliateId?: string;
  isAffiliateEntry?: boolean;
  biasGroup?: {
    [group: string]: number | string;
  };
}

interface ReceiptVerifier {
  receiptVerifierService?: string;
  receiptVerifierServerProxy?: string;
}

interface defaultAddressOptions {
  allowUndefined?: boolean;
}

type WebMonetization = {
  currentPool: WMPointer[];
};

interface WebMonetizationOptions extends fundOptions {}

interface IWebMonetization {
  PUBLIC_RECEIPT_VERIFIER_SERVICE: string;
}

type WMBiasGroup = {
  [group: string]: string | number;
};

// declare var document: any;
// declare var window: any;
