import { get, set, clear as idbClear, entries, createStore } from "idb-keyval";
import { fund } from "./fund";
import { convertToPointer } from "./set-pointer-multiple";
import { getCurrentPointerAddress } from "./utils";

const IDB_REFERRER_KEY: string = "referrer";
const IDB_DYNAMIC_REVSHARE_DB_NAME: string = "dynamic-revshare";

interface AffiliateData {
  affiliate: string;
  affiliateId: string;
  affiliateName: string;
}

interface DynamicRevshareFactory {
  // referrer: string;
  setReferrer: (pointers: WMPointer | string) => Promise<void>;
  /**
   *
   */
  load: () => Promise<WMPointer | null>;
  /**
   * Sync dynamic revshare referrers of under this key with the current route.
   * Leave `route` parameter empty to let Webfunding sync to the current
   * webpage's location under this dynamic revshare instance is being setup.
   */
  syncRoute: (route?: Location, opts?: { forceWebfundingRestart: boolean }) => AffiliateData;
  /**
   * Clear all referrers' data from this dynamic revshare instance from browsers' local database.
   */
  clear: () => Promise<void>;
}

export let currentWebfundingReferrer: string | undefined;

export function setupDynamicRevshare(key: string): DynamicRevshareFactory {
  const store = createStore(IDB_DYNAMIC_REVSHARE_DB_NAME, IDB_REFERRER_KEY);
  return {
    setReferrer: async function (pointer: WMPointer | string) {
      // TODO - make webfunding syntax as default parameter and dissect it
      try {
        if (typeof pointer === "string") {
          pointer = convertToPointer(pointer);
        } else {
          if (!("address" in pointer && "weight" in pointer)) {
            throw new Error("Payment pointer must have correct address and weight key.");
          }
        }
        const { address, weight } = pointer;
        await set(key, { address, weight }, store);
      } catch (err) {
        throw new Error(err);
      }
    },
    load: async function (): Promise<WMPointer> {
      // this.referrer = get(store, IDB_REFERRER_KEY) as string;
      return ((await get(key, store)) as WMPointer) || null;
    },
    syncRoute: function (
      page: Location = window?.location,
      opts = {
        forceWebfundingRestart: true,
      },
    ): AffiliateData {
      const searchParams = new URL(page.href).searchParams;
      const affiliate = searchParams.get("affiliate") as string;
      const affiliateName = searchParams.get("affiliate-name") as string;
      const affiliateId = searchParams.get("affiliate-id") as string;

      if (affiliate) this.setReferrer(decodeURI(affiliate));
      if (opts?.forceWebfundingRestart) {
        // check if webfunding is running, then restart it
        if (getCurrentPointerAddress()) fund();
      }

      return { affiliate, affiliateId, affiliateName };
    },
    clear: async function () {
      await idbClear(store);
    },
  };
}
