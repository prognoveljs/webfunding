var webfunding = (function (exports) {
  'use strict';

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }

  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

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

  var splitFundError = "must set web monetization pointer address with fund() before split.";
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
  function clear() {
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
    clear();
    pointerPoolSum = getPoolWeightSum(pool);
    var relativeWeightPointers;
    relativeWeightPointers = pool.filter(filterRelativeWeight); // console.log(relativeWeightPointers);

    if (!fixedWeightPointers.length) throw WebfundingError(paymentPointersMustHaveAtLeastOneFixedPointer);
    return [].concat(_toConsumableArray(normalizeFixedPointers(fixedWeightPointers, totalRelativeChance)), _toConsumableArray(normalizeRelativePointers(relativeWeightPointers)));
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
      return setWebMonetizationPointer(pointerAddress);
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
    var choice = Math.random() * sum;
    return choice;
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

  function isMultiplePointer(s) {
    return Array.isArray(s);
  }
  function setWebMonetizationPointer(address) {
    var wmAddress = document.head.querySelector('meta[name="monetization"]');
    return setWebMonetizationTag(wmAddress, address);
  }
  function setWebMonetizationTag(wmAddress, address) {
    if (!wmAddress) {
      wmAddress = createWebMonetizationTag(address);
    } else {
      wmAddress.content = address;
    }

    return wmAddress;
  }
  function createWebMonetizationTag(address) {
    var wmAddress = document.createElement("meta");
    wmAddress.name = "monetization";
    wmAddress.content = address;
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
      return setWebMonetizationPointer(pointer);
    }

    return pointer;
  }

  var WEBFUNDING_TEMPLATE_SELECTOR = "template[data-fund]";
  var WEBFUNDING_CUSTOM_SYNTAX_SELECTOR = "template[webfunding]";
  var WEBFUNDING_JSON_SELECTOR = "script[webfunding]";
  function setPointerFromTemplates() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var pointers = [].concat(_toConsumableArray(scrapeTemplate()), _toConsumableArray(scrapeJson()), _toConsumableArray(scrapeCustomSyntax()));

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
        pointers = [].concat(_toConsumableArray(pointers), [pointer]);
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
        pointers = [].concat(_toConsumableArray(pointers), _toConsumableArray(parseCustomSyntax(template)));
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
        pointers = [].concat(_toConsumableArray(pointers), [convertToPointer(strippedString)]);
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

  exports.fund = fund;
  exports.getCurrentPointerAddress = getCurrentPointerAddress;
  exports.getCurrentPointerPool = getCurrentPointerPool;
  exports.setDefaultAddress = setDefaultAddress;
  exports.splitFund = splitFund;

  return exports;

}({}));
