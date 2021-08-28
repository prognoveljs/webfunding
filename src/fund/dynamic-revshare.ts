import { get, set, clear as idbClear, entries, createStore } from "idb-keyval";
import { fund } from "./fund";
import { getCurrentPointerAddress } from "./utils";

const IDB_REFERRER_KEY: string = "referrer";
const IDB_DYNAMIC_REVSHARE_DB_NAME: string = "dynamic-revshare";

interface DynamicRevshareFactory {
  // referrer: string;
  setReferrer: (referrer: string, chance: number) => Promise<void>;
  /**
   * Setup referrers' data from remote REST API.
   * Remote API must return an array of valid Webfunding string or object.
   * Useful if combined with persistent remote database and user auth scheme since browsers can wipeout
   * local database at any time.
   */
  setRemoteData: (url: string, headers?: any) => Promise<void>;
  /**
   *
   */
  load: () => Promise<string[]>;
  /**
   * Sync dynamic revshare referrers of under this key with the current route.
   * Leave `route` parameter empty to let Webfunding sync to the current
   * webpage's location under this dynamic revshare instance is being setup.
   */
  syncRoute: (route?: string, opts?: { forceWebfundingRestart: boolean }) => void;
  /**
   * Clear all referrers' data from this dynamic revshare instance from browsers' local database.
   */
  clear: () => Promise<void>;
}

export let currentWebfundingReferrer: string | undefined;

export function setupDynamicRevshare(key: string): DynamicRevshareFactory {
  const store = createStore(IDB_DYNAMIC_REVSHARE_DB_NAME, key);
  return {
    setReferrer: async function (referrerWebfundingPointer: WMPointer) {
      // TODO - make webfunding syntax as default parameter and dissect it
      const { address, weight } = referrerWebfundingPointer;
      set(address, weight, store);
    },
    setRemoteData: async function (url: string, headers?: any) {
      try {
        const response = await fetch(url, {
          headers: headers ?? {},
        });
        const data = await response.json();

        // TODO - allow setReferrer of an array
        this.setReferrer_;
      } catch (err) {
        throw new Error(err);
      }
    },
    load: async function (): Promise<string[]> {
      // this.referrer = get(store, IDB_REFERRER_KEY) as string;
      const pointers = await entries(store);

      return (pointers || []).map(([referrer, chance]) => {
        return `${referrer}#${chance}`;
      });
    },
    syncRoute: function (
      route?: string,
      opts = {
        forceWebfundingRestart: true,
      },
    ) {
      // if (!route) route = window.location();
      currentWebfundingReferrer = route;

      if (opts?.forceWebfundingRestart) {
        // check if webfunding is running, then restart it
        if (getCurrentPointerAddress()) fund();
      }
    },
    clear: async function () {
      await idbClear(store);
    },
  };
}