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
  load: () => Promise<string | null>;
  /**
   * Sync dynamic revshare referrers of under this key with the current route.
   * Leave `route` parameter empty to let Webfunding sync to the current
   * webpage's location under this dynamic revshare instance is being setup.
   */
  syncRoute: (
    route?: Location,
    opts?: { forceWebfundingRestart: boolean },
  ) => Promise<AffiliateData>;
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
        const { address } = pointer;
        await set(key, address, store);
      } catch (err) {
        throw new Error(err as string);
      }
    },
    load: async function (): Promise<string | null> {
      // this.referrer = get(store, IDB_REFERRER_KEY) as string;
      return ((await get(key, store)) as string) || null;
    },
    syncRoute: async function (
      page: Location = window?.location,
      opts = {
        forceWebfundingRestart: false,
      },
    ): Promise<AffiliateData> {
      const searchParams = new URL(page.href).searchParams;
      let affiliate = decodeURI(searchParams.get("affiliate") || "") as string;
      let affiliateName = decodeURI(searchParams.get("affiliate-name") || "") as string;
      let affiliateId = decodeURI(searchParams.get("affiliate-id") || "") as string;

      const load = await this.load();

      if (load) {
        affiliate = load;
      } else {
        if (affiliate) this.setReferrer(affiliate);
      }

      if (opts?.forceWebfundingRestart) {
        // check if webfunding is running, then restart it
        if (!document.querySelector('meta[name="monetization"]')) fund();
      }

      return { affiliate, affiliateId, affiliateName };
    },
    clear: async function () {
      await idbClear(store);
    },
  };
}
