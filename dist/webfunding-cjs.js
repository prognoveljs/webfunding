'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _toConsumableArray = require('@babel/runtime/helpers/toConsumableArray');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
var _regeneratorRuntime = require('@babel/runtime/regenerator');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _toConsumableArray__default = /*#__PURE__*/_interopDefaultLegacy(_toConsumableArray);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);
var _asyncToGenerator__default = /*#__PURE__*/_interopDefaultLegacy(_asyncToGenerator);
var _regeneratorRuntime__default = /*#__PURE__*/_interopDefaultLegacy(_regeneratorRuntime);

function WebfundingError(err) {
  return "Webfunding.js: " + err;
}
var addressNotFound = "address not found.";
var addressIsNotAString = "address must be a string.";
var getCurrentPointerAddressMustClientSide = "can't use getCurrentPointerAddress() server-side.";
var invalidAddress = "invalid Web Monetization pointer address is given."; // multiple pointers

var getWinningPointerMustBeANumber = "all pointers' weight during calculating a winning pointer must have type of number."; // default address

var defaultAddressNotFound = "default address not found. Use setDefaultAddress(str: string) to set it first.";
var invalidDefaultAddress = "invalid default address.";
var defaultAddressArrayCannotBeEmpty = "invalid default address."; // utils

var canOnlyCleanStringCustomSyntax = "can only clean custom syntax with typeof string."; // about meta tag for Web Monetization API

var metaTagNotFound = "web monetization meta tag is not found.";
var metaTagMultipleIsFound = 'multiple <meta name="monetization" /> found - Web Monetization API only support a single meta tag.'; // pointers template

var noTemplateFound = "no monetization template is found.";
var failParsingTemplate = "fails to parse address from <template data-fund></template>.";

var cannotParseScriptJson = "cannot parse JSON from <script webfunding>. Make sure it contains a valid JSON.";
var jsonTemplateIsInvalid = "found <script webfunding> but it's not valid.";
var scriptWebfundingIsNotApplicationJson = 'found <script webfunding> but its type is not "application/json"'; // relative weight

var paymentPointersMustHaveAtLeastOneFixedPointer = "revenue sharing payment pointers must have at least one payment address pointer with fixed weight.";
var relativeWeightChanceError = "error when calculating total relative weight chance. Make sure it's a float between 0~1.0.";
var weightForRelativePointerNotFound = function weightForRelativePointerNotFound(address) {
  return "payment pointer weights not found for ".concat(address);
};
var relativeWeightMustEndsWithPercentage = "relative weights must end with character %.";
var invalidRelativeWeight = function invalidRelativeWeight(address) {
  return "relative weight for payment pointer ".concat(address, " must be integer or float.");
};
var invalidWeight = function invalidWeight(address, weight) {
  return "weight for payment pointer ".concat(address, "#").concat(weight, " is invalid.");
}; // split fund

var splitFundError = "must set web monetization pointer address with fund() before split."; // stats

var getStatsPercentageErrorPointerIsUndefined = "get revshare stats failed to get payment pointer percentage stats. Pointer is invalid or undefined.";
var getStatsPercentageErrorGettingCurrentPool = "get revshare stats failed to get current payment pointer pool.";
var getStatsPercentageErrorCalculatingWeightSum = "get revshare stats failed to calculate payment pointer chance sum.";
var getStatsPercentageErrorCalculatingRelativeWeight = "get revshare stats failed to calculate relative weight.";
var getStatsPercentageErrorPickingAddress = "get revshare stats failed when picking address in pointer pool array.";
/*****************************
 *                           *
 *  Server-side fund()       *
 *                           *
 *****************************/

var noUndefinedFundOnServerSide = "can't use fund() with empty parameters in server side.";
var invalidWebfundingServerSide = "invalid webfunding on the server-side.";

var relativeWeightPointers = [];
var fixedWeightPointers = [];
var totalRelativeChance = 0;
var pointerPoolSum = 0;
function clear$1() {
  relativeWeightPointers = [];
  fixedWeightPointers = [];
  totalRelativeChance = 0;
  pointerPoolSum = 0;
  return {
    relativeWeightPointers: relativeWeightPointers,
    fixedWeightPointers: fixedWeightPointers,
    totalRelativeChance: totalRelativeChance,
    pointerPoolSum: pointerPoolSum
  };
}
function calculateRelativeWeight(pool) {
  clear$1();
  pool = JSON.parse(JSON.stringify(pool)); // fix mutating original object

  pointerPoolSum = getPoolWeightSum(pool);
  var relativeWeightPointers;
  relativeWeightPointers = pool.filter(filterRelativeWeight); // console.log(relativeWeightPointers);

  if (!fixedWeightPointers.length) throw WebfundingError(paymentPointersMustHaveAtLeastOneFixedPointer);
  return [].concat(_toConsumableArray__default['default'](normalizeFixedPointers(fixedWeightPointers, totalRelativeChance)), _toConsumableArray__default['default'](normalizeRelativePointers(relativeWeightPointers)));
}
function filterRelativeWeight(pointer) {
  if (pointer.weight === undefined) return false;
  var weight = pointer.weight;

  if (typeof weight === "string" && weight.endsWith("%")) {
    var convertedWeight = weight.slice(0, -1);

    if (!isNumberOnly(convertedWeight)) {
      throw WebfundingError(invalidRelativeWeight(pointer.address));
    }

    registerRelativeWeight(pointer);
    return true;
  }

  if (isNumberOnly(weight)) {
    registerFixedWeight(pointer);
    return false;
  }

  throw WebfundingError(invalidWeight(pointer.address, weight));
}
function registerRelativeWeight(pointer) {
  pointer.weight = getRelativeWeight(pointer);
  relativeWeightPointers.push(pointer);
}
function registerFixedWeight(pointer) {
  if (typeof pointer.weight === "string") {
    pointer.weight = parseFloat(pointer.weight);
  }

  fixedWeightPointers.push(pointer);
}
function normalizeFixedPointers(pool, chance) {
  if (chance > 1 || chance === NaN) throw WebfundingError(relativeWeightChanceError);
  chance = 1 - chance; // decrease all fixed pointer weights
  // based on total relative chance registered

  return pool.map(function (pointer) {
    var weight;

    if (typeof pointer.weight === "string") {
      weight = parseFloat(pointer.weight);
    } else {
      var _pointer$weight;

      weight = (_pointer$weight = pointer.weight) !== null && _pointer$weight !== void 0 ? _pointer$weight : DEFAULT_WEIGHT;
    }

    pointer.weight = weight * chance;
    return pointer;
  });
}
function normalizeRelativePointers(pool, sum) {
  return pool.map(function (pointer) {
    return pointer;
  });
}
function getRelativeWeight(pointer) {
  var chance;

  if (typeof pointer === "string") {
    var weight = pointer.split("#")[1];

    if (pointer.endsWith("%")) {
      chance = parseFloat(weight) / 100;
    } else {
      throw WebfundingError(relativeWeightMustEndsWithPercentage);
    }
  } else {
    if (!pointer.weight) {
      throw WebfundingError(weightForRelativePointerNotFound(pointer.address));
    }

    if (typeof pointer.weight === "string") {
      if (!pointer.weight.endsWith("%")) throw WebfundingError(relativeWeightMustEndsWithPercentage);
      pointer.weight = parseFloat(pointer.weight);
    } else {
      throw WebfundingError(invalidRelativeWeight(pointer.address));
    }

    chance = pointer.weight / 100;
  }

  totalRelativeChance += chance;
  return pointerPoolSum * chance; // TODO - add % unit to calculate weight
} // Jest related functions

var DEFAULT_WEIGHT = 5; // TODO check pointer.address with RegEx

function setPointerMultiple(pointers) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var pool = createPool(pointers);
  pool = calculateRelativeWeight(pool);
  var pickedPointer = pickPointer(pool);
  var pointerAddress = getPointerAddress(pickedPointer);
  setCurrentPointer(pool);

  if (isBrowser(options)) {
    return setWebMonetizationPointer(pointerAddress, options);
  }

  return pointerAddress;
}
function getPointerAddress(pointer) {
  var address = pointer.address;

  if (!address) {
    throw WebfundingError(addressNotFound);
  } else if (typeof address !== "string") {
    throw WebfundingError(addressIsNotAString);
  }

  return address;
}
function createPool(pointers) {
  return pointers.map(function (pointer) {
    var wmPointer;
    if (typeof pointer === "string") pointer = convertToPointer(pointer);
    if (!hasAddress(pointer)) throw WebfundingError(addressNotFound);
    wmPointer = checkWeight(pointer);
    return wmPointer;
  });
} // TODO update checkWeight to use relative weight instead

function checkWeight(pointer) {
  if (pointer.weight === undefined || pointer.weight === NaN) {
    // if (window) console.warn(weightIsNotANumber(pointer.address));
    pointer.weight = DEFAULT_WEIGHT;
  }

  return pointer;
}
function pickPointer(pointers) {
  var sum = getPoolWeightSum(pointers);
  var choice = getChoice(sum);
  return getWinningPointer(pointers, choice);
}
function getChoice(sum) {
  return Math.random() * sum;
}
function convertToPointer(str) {
  var address = str;
  var weight;
  var split = str.split("#");

  if (split.length > 1) {
    address = split[0];
    weight = split[1];
  }

  var pointer = {
    address: address,
    weight: weight
  };
  return checkWeight(pointer);
}

function getReceiptURL(url, verifyServiceEndpoint) {
  if (!verifyServiceEndpoint) return url;
  if (verifyServiceEndpoint.substring(-1) !== "/") verifyServiceEndpoint += "/";
  return verifyServiceEndpoint + encodeURIComponent(url);
}

function isMultiplePointer(s) {
  return Array.isArray(s);
}
function setWebMonetizationPointer(address, opts) {
  var wmAddress = document.head.querySelector('meta[name="monetization"]');
  return setWebMonetizationTag(wmAddress, address, opts);
}
function setWebMonetizationTag(wmAddress, address, opts) {
  if (!wmAddress) {
    wmAddress = createWebMonetizationTag(address, opts);
  } else {
    wmAddress.content = getReceiptURL(address, (opts === null || opts === void 0 ? void 0 : opts.receiptVerifierService) || "");
  }

  return wmAddress;
}
function createWebMonetizationTag(address, opts) {
  var wmAddress = document.createElement("meta");
  wmAddress.name = "monetization";
  wmAddress.content = getReceiptURL(address, (opts === null || opts === void 0 ? void 0 : opts.receiptVerifierService) || "");
  document.head.appendChild(wmAddress);
  return wmAddress;
}
function getPoolWeightSum(pointers) {
  var weights = pointers.map(function (pointer) {
    var _pointer$weight;

    return (_pointer$weight = pointer.weight) !== null && _pointer$weight !== void 0 ? _pointer$weight : DEFAULT_WEIGHT; // TODO - safecheck null assertion
  });
  return Object.values(weights).reduce(function (sum, weight) {
    if (isNumberOnly(weight)) {
      if (typeof weight === "string") weight = parseFloat(weight);
      return sum + weight;
    } else {
      return sum;
    }
  }, 0);
}
function getWinningPointer(pointers, choice) {
  for (var pointer in pointers) {
    var _pointers$pointer$wei;

    var _weight = (_pointers$pointer$wei = pointers[pointer].weight) !== null && _pointers$pointer$wei !== void 0 ? _pointers$pointer$wei : DEFAULT_WEIGHT; // TODO - safecheck null assertion


    if (typeof _weight !== "number") throw WebfundingError(getWinningPointerMustBeANumber);

    if ((choice -= _weight) <= 0) {
      return pointers[pointer];
    }
  } // Decide if this will be the default behavior later
  // in case unexpected case where choice is greater than all pointers' weight


  return pointers[0];
}
function hasAddress(obj) {
  if (!obj) return false;
  return Object.keys(obj).some(function (str) {
    return str === "address";
  });
}
var defaultAddress;
function setDefaultAddress(address) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (Array.isArray(address)) {
    if (address.length) {
      defaultAddress = createPool(address);
      return;
    } else {
      throw WebfundingError(defaultAddressArrayCannotBeEmpty);
    }
  }

  if (typeof address === "string") {
    defaultAddress = address;
    return;
  }

  if (hasAddress(address)) {
    defaultAddress = getPointerAddress(address);
    return;
  }

  if (options.allowUndefined && address === undefined) {
    // @ts-ignore
    defaultAddress = undefined; // TODO check if ts-ignore break things

    return;
  }

  throw WebfundingError(invalidDefaultAddress);
}
function getDefaultAddress() {
  return defaultAddress;
}
function defaultAddressMultiple(address) {
  return isMultiplePointer(address) ? address : [address];
}
var currentFundType;
function setFundType(type) {
  currentFundType = type;
  return currentFundType;
}
var currentPointer;
function setCurrentPointer(pointer) {
  currentPointer = pointer;
}
function getCurrentPointerAddress() {
  // const forced = forceBrowser
  if (isBrowser()) {
    var metaTag = document.head.querySelectorAll('meta[name="monetization"]');

    if (metaTag.length > 1) {
      throw WebfundingError(metaTagMultipleIsFound);
    }

    if (metaTag[0]) {
      return metaTag[0].content;
    }

    throw WebfundingError(metaTagNotFound);
  } else {
    if (currentPointer) return currentPointer.toString();
    throw WebfundingError(getCurrentPointerAddressMustClientSide);
  }
}
function cleanSinglePointerSyntax(pointer) {
  if (typeof pointer === "string") {
    pointer = pointer.split("#")[0];
  } else {
    throw WebfundingError(canOnlyCleanStringCustomSyntax);
  }

  return pointer;
}
function getCurrentPointerPool() {
  var pointer = currentPointer;
  return convertToPointerPool(pointer);
}
function convertToPointerPool(pointer) {
  if (!Array.isArray(pointer) && pointer !== undefined) {
    pointer = [pointer];
  }

  return pointer || [];
}
function isNumberOnly(text) {
  if (typeof text === "string") {
    var regex = /^[0-9]*$/;
    return regex.test(text);
  }

  return typeof text === "number";
}

function setPointerSingle(pointer) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  pointer = cleanSinglePointerSyntax(pointer);
  setCurrentPointer(pointer);

  if (isBrowser(options)) {
    return setWebMonetizationPointer(pointer, options);
  }

  return pointer;
}

var WEBFUNDING_TEMPLATE_SELECTOR = "template[data-fund]";
var WEBFUNDING_CUSTOM_SYNTAX_SELECTOR = "template[webfunding]";
var WEBFUNDING_JSON_SELECTOR = "script[webfunding]";
function setPointerFromTemplates() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var pointers = [].concat(_toConsumableArray__default['default'](scrapeTemplate()), _toConsumableArray__default['default'](scrapeJson()), _toConsumableArray__default['default'](scrapeCustomSyntax()));

  if (pointers.length) {
    setPointerMultiple(pointers, options);
  } else {
    throw WebfundingError(noTemplateFound);
  }
} // DON'T throw errors inside scrape functions if array is found to be empty
// fund() already do that

function scrapeJson() {
  var scriptTags = document.body.querySelectorAll(WEBFUNDING_JSON_SELECTOR);
  var pointers = [];

  if (scriptTags.length) {
    scriptTags.forEach(function (json) {
      pointers = parseScriptJson(json);
    });
  }

  return pointers;
}

function parseScriptJson(json) {
  var pointers = [];
  var parsed;

  try {
    parsed = JSON.parse(json.innerHTML);
  } catch (err) {
    throw WebfundingError(cannotParseScriptJson);
  }

  if (json.type !== "application/json") {
    throw WebfundingError(scriptWebfundingIsNotApplicationJson);
  }

  if (Array.isArray(parsed)) {
    pointers = createPool(parsed);
  } else if (typeof parsed === "string") {
    pointers = createPool([parsed]);
  } else {
    throw WebfundingError(jsonTemplateIsInvalid);
  }

  return pointers;
}

function scrapeTemplate() {
  var templates = document.body.querySelectorAll(WEBFUNDING_TEMPLATE_SELECTOR);
  var pointers = [];

  if (templates.length) {
    templates.forEach(function (template) {
      var pointer = parseTemplate(template);
      pointers = [].concat(_toConsumableArray__default['default'](pointers), [pointer]);
    });
  }

  return pointers;
}
function parseTemplate(template) {
  var _template$dataset$fun;

  var address = template.dataset.fund;
  var weight = (_template$dataset$fun = template.dataset.fundWeight) !== null && _template$dataset$fun !== void 0 ? _template$dataset$fun : DEFAULT_WEIGHT;

  if (!address) {
    throw WebfundingError(failParsingTemplate);
  }

  var pointer = checkWeight({
    address: address,
    weight: weight
  });
  return pointer;
}
function scrapeCustomSyntax() {
  var templates = document.querySelectorAll(WEBFUNDING_CUSTOM_SYNTAX_SELECTOR);
  var pointers = [];

  if (templates.length) {
    templates.forEach(function (template) {
      pointers = [].concat(_toConsumableArray__default['default'](pointers), _toConsumableArray__default['default'](parseCustomSyntax(template)));
    });
  }

  return pointers;
}
function parseCustomSyntax(template) {
  var pointers = [];
  var temp = template.innerHTML;
  temp.split(";").forEach(function (str) {
    var strippedString = str.replace(/(^\s+|\s+$)/g, "");

    if (strippedString) {
      pointers = [].concat(_toConsumableArray__default['default'](pointers), [convertToPointer(strippedString)]);
    }
  });
  return pointers;
}

function clientSideFund(pointer, options) {
  if (pointer === undefined || pointer === null) {
    setPointerFromTemplates();
    return setFundType(FundType.isFromTemplate);
  }

  if (options && options.force === "server") {
    throw WebfundingError(invalidWebfundingServerSide);
  }

  if (typeof pointer === "string") {
    if (pointer === "default") {
      if (getDefaultAddress() !== undefined) {
        if (typeof getDefaultAddress() === "string") {
          setPointerSingle(getDefaultAddress().toString(), options);
        } else {
          setPointerMultiple(defaultAddressMultiple(getDefaultAddress()), options);
        }

        return setFundType(FundType.isDefault);
      } else {
        throw WebfundingError(defaultAddressNotFound);
      }
    }

    setPointerSingle(pointer, options);
    return setFundType(FundType.isSingle);
  }

  if (isMultiplePointer(pointer)) {
    setPointerMultiple(pointer, options);
    return setFundType(FundType.isMultiple);
  }

  throw WebfundingError(invalidAddress);
}
var forceBrowser = false;
var isNode = typeof process !== "undefined" && process.versions != null && process.versions.node != null;
var isBrowser = function isBrowser() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  if (options.force === "server") return false;
  var forced = forceBrowser;
  forceBrowser = false;
  return !isNode || forced || options.force === "client";
};

function serverSideFund(pointer) {
  if (pointer === null || pointer === undefined) throw WebfundingError(noUndefinedFundOnServerSide);

  if (typeof pointer === "string") {
    return setPointerSingle(pointer).toString();
  }

  if (isMultiplePointer(pointer)) {
    return setPointerMultiple(pointer).toString();
  }

  throw WebfundingError(invalidWebfundingServerSide);
}

var FundType;

(function (FundType) {
  FundType["isSingle"] = "single";
  FundType["isMultiple"] = "multiple";
  FundType["isDefault"] = "default";
  FundType["isFromTemplate"] = "template";
  FundType["isUndefined"] = "undefined";
})(FundType || (FundType = {}));

function fund(pointer) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (isBrowser(options)) {
    return clientSideFund(pointer, options);
  } else {
    if (pointer === undefined) {
      throw WebfundingError(noUndefinedFundOnServerSide);
    } else {
      return serverSideFund(pointer);
    }
  }
}

function splitFund(amount) {
  var pool = createPool(getCurrentPointerPool());
  var sum = 0;

  if (!pool.length) {
    throw WebfundingError(splitFundError);
  } else {
    // process pointer pool
    pool = calculateRelativeWeight(pool);
    sum = getPoolWeightSum(pool);
  }

  return pool.map(function (pointer) {
    var fraction = pointer.weight / sum;
    return {
      address: pointer.address,
      amount: amount * fraction,
      weight: pointer.weight
    };
  });
}

function getPaymentPointerSharePercentage(address, opts) {
  var pool;
  var sum;
  if (opts !== null && opts !== void 0 && opts.calculatedPool) pool = opts.calculatedPool;
  if (!pool && opts !== null && opts !== void 0 && opts.rawPool) pool = opts.rawPool;

  try {
    if (!pool) pool = createPool(getCurrentPointerPool());
  } catch (error) {
    throw WebfundingError(getStatsPercentageErrorGettingCurrentPool);
  }

  try {
    sum = (opts === null || opts === void 0 ? void 0 : opts.poolSum) || getPoolWeightSum(pool);
  } catch (error) {
    throw WebfundingError(getStatsPercentageErrorCalculatingWeightSum);
  }

  try {
    pool = calculateRelativeWeight(pool);
  } catch (error) {
    throw WebfundingError(getStatsPercentageErrorCalculatingRelativeWeight);
  }

  var pointer;

  try {
    pointer = pool.find(function (pointer) {
      return pointer.address === address;
    });
  } catch (error) {
    throw WebfundingError(getStatsPercentageErrorPickingAddress);
  }

  if (!pointer) return 0;
  if (!pointer.weight) throw WebfundingError(getStatsPercentageErrorPointerIsUndefined);
  return pointer.weight / sum;
}
function createWebfundingLeaderboard(pool, opts) {
  if (!pool) pool = createPool(getCurrentPointerPool());
  pool = calculateRelativeWeight(pool);
  var sum = getPoolWeightSum(pool);
  var leaderboard = pool.reduce(function (prev, cur) {
    prev.push({
      address: cur.address,
      chance: (cur.weight || DEFAULT_WEIGHT) / sum
    });
    return prev;
  }, []);
  return opts !== null && opts !== void 0 && opts.ascending ? leaderboard.sort(function (a, b) {
    return a.chance - b.chance;
  }) : leaderboard.sort(function (a, b) {
    return b.chance - a.chance;
  });
}

/**
 * https://bugs.webkit.org/show_bug.cgi?id=226547
 * Safari has a horrible bug where IDB requests can hang while the browser is starting up.
 * The only solution is to keep nudging it until it's awake.
 * This probably creates garbage, but garbage is better than totally failing.
 */
function idbReady() {
  var isSafari = !navigator.userAgentData && /Safari\//.test(navigator.userAgent) && !/Chrom(e|ium)\//.test(navigator.userAgent); // No point putting other browsers or older versions of Safari through this mess.

  if (!isSafari || !indexedDB.databases) return Promise.resolve();
  var intervalId;
  return new Promise(function (resolve) {
    var tryIdb = function tryIdb() {
      return indexedDB.databases().finally(resolve);
    };

    intervalId = setInterval(tryIdb, 100);
    tryIdb();
  }).finally(function () {
    return clearInterval(intervalId);
  });
}

function promisifyRequest(request) {
    return new Promise((resolve, reject) => {
        // @ts-ignore - file size hacks
        request.oncomplete = request.onsuccess = () => resolve(request.result);
        // @ts-ignore - file size hacks
        request.onabort = request.onerror = () => reject(request.error);
    });
}
function createStore(dbName, storeName) {
    const dbp = idbReady().then(() => {
        const request = indexedDB.open(dbName);
        request.onupgradeneeded = () => request.result.createObjectStore(storeName);
        return promisifyRequest(request);
    });
    return (txMode, callback) => dbp.then((db) => callback(db.transaction(storeName, txMode).objectStore(storeName)));
}
let defaultGetStoreFunc;
function defaultGetStore() {
    if (!defaultGetStoreFunc) {
        defaultGetStoreFunc = createStore('keyval-store', 'keyval');
    }
    return defaultGetStoreFunc;
}
/**
 * Get a value by its key.
 *
 * @param key
 * @param customStore Method to get a custom store. Use with caution (see the docs).
 */
function get(key, customStore = defaultGetStore()) {
    return customStore('readonly', (store) => promisifyRequest(store.get(key)));
}
/**
 * Set a value with a key.
 *
 * @param key
 * @param value
 * @param customStore Method to get a custom store. Use with caution (see the docs).
 */
function set(key, value, customStore = defaultGetStore()) {
    return customStore('readwrite', (store) => {
        store.put(value, key);
        return promisifyRequest(store.transaction);
    });
}
/**
 * Clear all values in the store.
 *
 * @param customStore Method to get a custom store. Use with caution (see the docs).
 */
function clear(customStore = defaultGetStore()) {
    return customStore('readwrite', (store) => {
        store.clear();
        return promisifyRequest(store.transaction);
    });
}

var IDB_REFERRER_KEY = "referrer";
var IDB_DYNAMIC_REVSHARE_DB_NAME = "dynamic-revshare";
function setupDynamicRevshare(key) {
  var store = createStore(IDB_DYNAMIC_REVSHARE_DB_NAME, IDB_REFERRER_KEY);
  return {
    setReferrer: function () {
      var _setReferrer = _asyncToGenerator__default['default']( /*#__PURE__*/_regeneratorRuntime__default['default'].mark(function _callee(pointer) {
        var _pointer, address, weight;

        return _regeneratorRuntime__default['default'].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;

                if (!(typeof pointer === "string")) {
                  _context.next = 5;
                  break;
                }

                pointer = convertToPointer(pointer);
                _context.next = 7;
                break;

              case 5:
                if ("address" in pointer && "weight" in pointer) {
                  _context.next = 7;
                  break;
                }

                throw new Error("Payment pointer must have correct address and weight key.");

              case 7:
                _pointer = pointer, address = _pointer.address, weight = _pointer.weight;
                _context.next = 10;
                return set(key, {
                  address: address,
                  weight: weight
                }, store);

              case 10:
                _context.next = 15;
                break;

              case 12:
                _context.prev = 12;
                _context.t0 = _context["catch"](0);
                throw new Error(_context.t0);

              case 15:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, null, [[0, 12]]);
      }));

      function setReferrer(_x) {
        return _setReferrer.apply(this, arguments);
      }

      return setReferrer;
    }(),
    load: function () {
      var _load = _asyncToGenerator__default['default']( /*#__PURE__*/_regeneratorRuntime__default['default'].mark(function _callee2() {
        return _regeneratorRuntime__default['default'].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return get(key, store);

              case 2:
                _context2.t0 = _context2.sent;

                if (_context2.t0) {
                  _context2.next = 5;
                  break;
                }

                _context2.t0 = null;

              case 5:
                return _context2.abrupt("return", _context2.t0);

              case 6:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));

      function load() {
        return _load.apply(this, arguments);
      }

      return load;
    }(),
    syncRoute: function syncRoute() {
      var _window;

      var page = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : (_window = window) === null || _window === void 0 ? void 0 : _window.location;
      var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
        forceWebfundingRestart: true
      };
      var searchParams = new URL(page.href).searchParams;
      var affiliate = searchParams.get("affiliate");
      var affiliateName = searchParams.get("affiliate-name");
      var affiliateId = searchParams.get("affiliate-id");
      if (affiliate) this.setReferrer(decodeURI(affiliate));

      if (opts !== null && opts !== void 0 && opts.forceWebfundingRestart) {
        // check if webfunding is running, then restart it
        if (getCurrentPointerAddress()) fund();
      }

      return {
        affiliate: affiliate,
        affiliateId: affiliateId,
        affiliateName: affiliateName
      };
    },
    clear: function () {
      var _clear = _asyncToGenerator__default['default']( /*#__PURE__*/_regeneratorRuntime__default['default'].mark(function _callee3() {
        return _regeneratorRuntime__default['default'].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return clear(store);

              case 2:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }));

      function clear$1() {
        return _clear.apply(this, arguments);
      }

      return clear$1;
    }()
  };
}

var WebMonetization = /*#__PURE__*/function () {
  function WebMonetization(opts) {
    _classCallCheck__default['default'](this, WebMonetization);

    _defineProperty__default['default'](this, "currentPool", []);

    _defineProperty__default['default'](this, "receiptVerifierServiceEndpoint", "$webmonetization.org/api/receipts/");

    _defineProperty__default['default'](this, "affiliatePointer", {
      affiliate: "affiliate",
      affiliateName: "affiliate-name",
      affiliateId: "affiliate-id"
    });

    this.options = opts;
    return this;
  }

  _createClass__default['default'](WebMonetization, [{
    key: "set",
    value: function set(pointers) {
      this.currentPool = Array.isArray(pointers) ? pointers : [pointers];
      return this;
    }
  }, {
    key: "add",
    value: function add(pointers) {
      return this.registerPaymentPointers(pointers);
    }
  }, {
    key: "registerPaymentPointers",
    value: function registerPaymentPointers(pointers) {
      if (!Array.isArray(pointers)) pointers = [pointers];
      this.currentPool = [].concat(_toConsumableArray__default['default'](this.currentPool), _toConsumableArray__default['default'](pointers));
      return this;
    }
  }, {
    key: "registerAffiliateReferrer",
    value: function registerAffiliateReferrer(id) {
      var dynamicRevshare = setupDynamicRevshare(id);

      var _dynamicRevshare$sync = dynamicRevshare.syncRoute(),
          affiliate = _dynamicRevshare$sync.affiliate;

      this.registerPaymentPointers(convertToPointer(affiliate));
      return this;
    }
  }, {
    key: "start",
    value: function start() {
      try {
        fund(this.currentPool, this.options);
      } catch (error) {
        console.warn(error);
      }

      return this;
    }
  }, {
    key: "reset",
    value: function reset() {
      this.start();
      return this;
    }
  }]);

  return WebMonetization;
}();

exports.WebMonetization = WebMonetization;
exports.createWebfundingLeaderboard = createWebfundingLeaderboard;
exports.fund = fund;
exports.getCurrentPointerAddress = getCurrentPointerAddress;
exports.getCurrentPointerPool = getCurrentPointerPool;
exports.getPaymentPointerSharePercentage = getPaymentPointerSharePercentage;
exports.setDefaultAddress = setDefaultAddress;
exports.splitFund = splitFund;
