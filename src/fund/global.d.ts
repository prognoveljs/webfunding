type WMAddress = string | Array<string | WMPointer> | undefined;
type returnValidPointer = string | HTMLMetaElement;
type defaultAddress = string | WMPointer | (string | WMPointer)[];
type address = string;
type weight = number | string;

interface WMPointer {
  address: string;
  weight?: weight;
}

interface WMPointerStats {
  address: string;
  chance: number;
}

interface fundOptions {
  force?: "client" | "server";
  maxPool?: number;
  default?: boolean;
  affiliateId?: string;
  isAffiliateEntry?: boolean;
  receiptVerifierService?: string;
}

interface defaultAddressOptions {
  allowUndefined?: boolean;
}

type WebMonetization = {
  currentPool: WMPointer[];
};

// declare var document: any;
// declare var window: any;
