'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function isMultiplePointer(s) {
    return Array.isArray(s);
}
function setWebMonetizationPointer(address) {
    let wmAddress = document.querySelector('meta[name="monetization"]');
    return setWebMonetizationTag(wmAddress, address);
}
function setWebMonetizationTag(wmAddress, address) {
    if (!wmAddress) {
        wmAddress = createWebMonetizationTag(address);
    }
    else {
        wmAddress.content = address;
    }
    return wmAddress;
}
function createWebMonetizationTag(address) {
    const wmAddress = document.createElement('meta');
    wmAddress.name = 'monetization';
    wmAddress.content = address;
    document.head.appendChild(wmAddress);
    return wmAddress;
}
function getPoolWeightSum(pointers) {
    const weights = pointers.map((pointer) => pointer.weight);
    return Object.values(weights).reduce((sum, weight) => sum + weight, 0);
}
function getWinningPointer(pointers, choice) {
    for (const pointer in pointers) {
        const weight = pointers[pointer].weight;
        if ((choice -= weight) <= 0) {
            return pointers[pointer];
        }
    }
}

function setPointerSingle(pointer) {
    setWebMonetizationPointer(pointer);
}

const defaultAddressNotFound = 'Fundme.js: default address not found. Use setDefaultAddress(str: string) to set it first.';
const invalidAddress = 'Fundme.js: Invalid Web Monetization pointer address is given.';
const addressNotFound = 'Fundme.js: address not found.';
const addressIsNotAString = 'Fundme.js: address must be a string.';
function weightIsNotANumber(str) {
    return `Fundme.js: ${str} has weight that is not a number. It has been set to ${DEFAULT_WEIGHT} (default).`;
}
// pointers template
const noTemplateFound = 'Fundme.js: no monetization template is found.';
const failParsingTemplate = 'Fundme.js: fails to parse address from <template data-fund></template>.';
// script json template
const cannotParseScriptJson = 'Fundme.js: cannot parse JSON from <script fundme>. Make sure it contains a valid JSON.';
const jsonTemplateIsInvalid = "Fundme.js: found <script fundme> but it's not valid.";
const scriptFundmeIsNotApplicationJson = 'Fundme.js: found <script fundme> but its type is not "application/json"';

const DEFAULT_WEIGHT = 5;
// TODO check pointer.address with RegEx
function setPointerMultiple(pointers) {
    const pool = createPool(pointers);
    const pickedPointer = pickPointer(pool);
    setWebMonetizationPointer(getPointerAddress(pickedPointer));
}
function getPointerAddress(pointer) {
    const address = pointer.address;
    if (!address) {
        throw new Error(addressNotFound);
    }
    else if (typeof address !== 'string') {
        throw new Error(addressIsNotAString);
    }
    return address;
}
function createPool(pointers) {
    return pointers.map((pointer) => {
        let wmPointer;
        if (typeof pointer === 'string')
            pointer = convertToPointer(pointer);
        if (!('address' in pointer))
            throw new Error(addressNotFound);
        wmPointer = checkWeight(pointer);
        return wmPointer;
    });
}
function checkWeight(pointer) {
    if (pointer.weight === undefined || pointer.weight === NaN) {
        console.warn(weightIsNotANumber(pointer.address));
        pointer.weight = DEFAULT_WEIGHT;
    }
    return pointer;
}
// TODO getting pointer from pool
function pickPointer(pointers) {
    const sum = getPoolWeightSum(pointers);
    let choice = getChoice(sum);
    return getWinningPointer(pointers, choice);
}
function getChoice(sum) {
    const choice = Math.random() * sum;
    return choice;
}
function convertToPointer(str) {
    let address = str;
    let weight;
    const split = str.split('#');
    if (split.length > 1) {
        address = split[0];
        weight = parseInt(split[1], 10);
    }
    const pointer = {
        address,
        weight: weight || DEFAULT_WEIGHT,
    };
    return pointer;
}

const FUNDME_TEMPLATE_SELECTOR = 'template[data-fund]';
const FUNDME_CUSTOM_SYNTAX_SELECTOR = 'template[fundme]';
const FUNDME_JSON_SELECTOR = 'script[fundme]';
function setPointerFromTemplates() {
    const pointers = [...scrapeTemplate(), ...scrapeJson(), ...scrapeCustomSyntax()];
    if (pointers.length) {
        setPointerMultiple(pointers);
    }
    else {
        throw new Error(noTemplateFound);
    }
}
// DON'T throw errors inside scrape functions if array is found to be empty
// fund() already do that
function scrapeJson() {
    const scriptTags = document.body.querySelectorAll(FUNDME_JSON_SELECTOR);
    let pointers = [];
    if (scriptTags.length) {
        scriptTags.forEach((json) => {
            pointers = parseScriptJson(json);
        });
    }
    return pointers;
}
function parseScriptJson(json) {
    let pointers = [];
    let parsed;
    try {
        parsed = JSON.parse(json.innerHTML);
    }
    catch (err) {
        throw new Error(cannotParseScriptJson);
    }
    if (json.type !== 'application/json') {
        throw new Error(scriptFundmeIsNotApplicationJson);
    }
    if (Array.isArray(parsed)) {
        pointers = createPool(parsed);
    }
    else if (typeof parsed === 'string') {
        pointers = createPool([parsed]);
    }
    else {
        throw new Error(jsonTemplateIsInvalid);
    }
    return pointers;
}
function scrapeTemplate() {
    const templates = document.body.querySelectorAll(FUNDME_TEMPLATE_SELECTOR);
    let pointers = [];
    if (templates.length) {
        templates.forEach((template) => {
            const pointer = parseTemplate(template);
            pointers = [...pointers, pointer];
        });
    }
    return pointers;
}
function parseTemplate(template) {
    let address = template.dataset.fund;
    let weight = template.dataset.fundWeight !== undefined ? parseInt(template.dataset.fundWeight, 0) : DEFAULT_WEIGHT;
    if (!address) {
        throw new Error(failParsingTemplate);
    }
    const pointer = checkWeight({
        address,
        weight,
    });
    return pointer;
}
function scrapeCustomSyntax() {
    const templates = document.querySelectorAll(FUNDME_CUSTOM_SYNTAX_SELECTOR);
    let pointers = [];
    if (templates.length) {
        templates.forEach((template) => {
            pointers = [...pointers, ...parseCustomSyntax(template)];
        });
    }
    return pointers;
}
function parseCustomSyntax(template) {
    let pointers = [];
    const temp = template.innerHTML;
    temp.split(';').forEach((str) => {
        const strippedString = str.replace(/(^\s+|\s+$)/g, '');
        if (strippedString) {
            pointers = [...pointers, convertToPointer(strippedString)];
        }
    });
    return pointers;
}

let defaultAddress;
let currentFundType;
var FundType;
(function (FundType) {
    FundType["isSingle"] = "single";
    FundType["isMultiple"] = "multiple";
    FundType["isDefault"] = "default";
    FundType["isFromTemplate"] = "template";
    FundType["isUndefined"] = "undefined";
})(FundType || (FundType = {}));
function fund(pointer, options) {
    if (typeof pointer === 'string') {
        if (pointer === 'default') {
            if (defaultAddress !== undefined) {
                if (typeof defaultAddress === 'string') {
                    setPointerSingle(defaultAddress);
                }
                else {
                    setPointerMultiple(defaultAddress);
                }
                return setFundType(FundType.isDefault);
            }
            else {
                throw new Error(defaultAddressNotFound);
            }
        }
        setPointerSingle(pointer);
        return setFundType(FundType.isSingle);
    }
    if (isMultiplePointer(pointer)) {
        setPointerMultiple(pointer);
        return setFundType(FundType.isMultiple);
    }
    if (pointer === undefined) {
        setPointerFromTemplates();
        return setFundType(FundType.isFromTemplate);
    }
    throw new Error(invalidAddress);
}
function setDefaultAddress(address) {
    if (Array.isArray(address)) {
        defaultAddress = createPool(address);
    }
    else {
        defaultAddress = address;
    }
}
function setFundType(type) {
    currentFundType = type;
    return currentFundType;
}

exports.fund = fund;
exports.setDefaultAddress = setDefaultAddress;
