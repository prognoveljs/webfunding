# Releases

## 0.3.0

- Update readme to use newly Web Monetization class
- (Feat): add `.setBiasGroup()` to Web Monetization class
- (Addjust): `affiliate` as default ID for Web Monetization class setupDynamicRevshare function.

## 0.2.6

Initlaize WebMonetization class. Early affiliate and bias system implemented.

## 0.2.1 ~ 0.2.5

Adjustment from migrating from Fundme.js to Webfunding.js

## 0.2.0

- Migrate to webfunding repo
- Allow `getPaymentPointerSharePercentage` and `createWebfundingLeaderboard` to get revenue share stats among contributors.

## 0.1.8

- New site added to package.json.

## 0.1.7

- FEATURE: new feature splitFund(amount) can return an array of parameter's fraction based on established fundme pointer pool.
- rename package entry .ts file `fundme.ts` -> `index.ts`.

## 0.1.6

- Bump dependencies
- Install dependabot
- tests: improve to 100% coverage

## 0.1.5

- Hotfix: fix nodejs env check error (now for real)

## 0.1.4

- Hotfix: fix require undefined error on browser.

## 0.1.3

- Fix: critical error when using ES Modules version.

## 0.1.2

- FEATURE: basic calculation of relative weight is now live!
- Removing rollup typescript plugin and use Babel instead, allowing to use upcoming modern javascript feature (such as nullish coalescing, etc).
- bump dependencies.

## 0.1.1

- FEATURE: Server-side fund() now live.
- Hash custom syntax `#` for declaring weight cleaned on single pointer fund().
- Errors now more readable.
- Refactor main.ts

## 0.1.0

- FEATURE: Custom syntax with `<template webfunding></template>` tags.

## 0.0.5

- Now you can use string to provide payment pointer address weight with modifier `#`. For example: `$wallet.address.com/test#22` will be read as having `$wallet.address.com/test` as its address and has `22` weight.
- Fix: error parsing JSON `<script webfunding>` if the content is `string`.

## 0.0.4

- Add examples for using fundme.js in the browser.
- Now `<script webfunding>` will throw an error if its type not `application/json`.
- Test: add test for `<script webfunding>` type.

## 0.0.3

- Change production IIFE script name from `fund` to `fundme`. Calling fundme.js in browser now using `fundme.fund()` (previously `fund.fund()` with IIFE).
- Add Server-Side on the roadmap.

## 0.0.2

- Previous NPM publish is accidental and the document isn't clear yet, now README.md has been updated.
- Make it clear that this is a client-side library and tested with ES Module imports
- Link github repo to package.json

## 0.0.1

- Hello world!
