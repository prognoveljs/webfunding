# 💸 Webfunding.js 💸

A simple but powerful client-side library to manage monetization on the web. Think of jQuery of monetization of the web.

![Build](https://github.com/prognoveljs/webfunding/workflows/Build/badge.svg)
[![Coverage Status](https://coveralls.io/repos/github/prognoveljs/webfunding/badge.svg?branch=master)](https://coveralls.io/github/prognoveljs/webfunding?branch=master) ![GitHub top language](https://img.shields.io/github/languages/top/prognoveljs/webfunding) ![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/webfunding) ![npm](https://img.shields.io/npm/v/webfunding) ![npm bundle size](https://img.shields.io/bundlephobia/minzip/webfunding)

## ✨ What is this, really (?)

Webfunding.js is a tree-shakable library to manage monetization on the web, derived from a library called Fundme.js, now focused on exploring advanced business models with the new and shiny [Web Monetization API](https://www.webmonetization.org).

Main features of Webfunding.js includes advanced and flexible revenue sharing, and instant affiliate marketing generator, all can be done in a few line of JavaScript.

***


> _⚠️ This library is still work in progress and an experimental project, not ready for production! ⚠️_


### Get Started with Web Monetization API

Web Monetization API is a new web standard being developed to provide better payment alternative for publishers and creators other than ads. Learn more about it on [https://www.webmonetization.org](https://www.webmonetization.org).

#### Using Webfunding.js in Client-Side with bundler; webpack, rollup, parcel, etc

```shell
npm i webfunding --save
```

Example with ES Modules:

```js
import { WebMonetization } from 'webfunding'

const money = new WebMonetization()
  .registerPaymentPointers('$wallet.example.com/some-guy-funding-address')
  .start();
```

Above is an example of most basic function of Webfunding.js, which is to start streaming Web Monetization to a Interledger-enabled digital wallet address.

#### Using Webfunding.js in the browser

Webfunding.js is designed to be fully tree-shakeable library thus it has quite a weird way to use in the browser than normal library. It needs to use IIFE (Immediately Invoked Function Expression) to get exported function that normally use in brackets when importing it with ES Module.

```html
<script src="https://cdn.jsdelivr.net/npm/webfunding/dist/webfunding-iife.js"></script>
<script>
  const { WebMonetization } = webfunding;

  const money = new WebMonetization()
    .registerPaymentPointers('$wallet.example.com/some-guy-funding-address')
    .start();
</script>
```

or with Browser native ES modules:

```html
<script type="module">
  import { WebMonetization } from 'webfunding'

  const money = new WebMonetization()
    .registerPaymentPointers('$wallet.example.com/some-guy-funding-address')
    .start();
</script>
```

### 💵 💴 Advanced Monetization - Revenue Share Among Contributors 💶 💷

Web Monetization is commonly start streaming money to a single payment pointer, but you can split revenue using [Probabilitic Revenue Sharing](https://coil.com/p/sharafian/Probabilistic-Revenue-Sharing/8aQDSPsw) method that relies on chance whoever gets picked among contributors.

To split revenue, `.registerPaymentPointers()` must take an array containing strings or our own opiniated Web Monetization pointer object. Pointer address objects must have `address` and `weight` in it.

Below is a scenario where author of a content get the most of the revenue of an article, while editor and proofreader get the same slice of the pie, while the website owner get the least (website owner's chance isn't being implictly set, but more that on the code).

#### With pure JavaScript

```js
import { WebMonetization } from 'webfunding'

const AuthorPointerAddress = {
  address: '$wallet.example.com/author-address',
  weight: 40,
};

const EditorPointerAddress = {
  address: '$wallet.example.com/editor-address',
  weight: 10,
};

const ProofreaderPointerAddress = {
  address: '$wallet.example.com/proofreader-address',
  weight: 10,
};

// pointers with type string or those with no weight will use
// default weight which is 5
const WebsiteOwnerPointerAddress = '$wallet.example.com/website-owner';

// calling the function...
const money = new WebMonetization()
  .registerPaymentPointers([AuthorPointerAddress, EditorPointerAddress, ProofreaderPointerAddress, WebsiteOwnerPointerAddress])
  .start();
```

Additionally, in case you don't like working with objects, it's possible to work solely with an array of strings but still declaring their chances. Webfunding.js will read modifier `#` at the end of the pointer address as a way to read a payment pointer's weight.

```js
import { WebMonetization } from 'webfunding'

const money = new WebMonetization()
  .registerPaymentPointers([
    '$wallet.example.com/this-has-weight-ten#10',
    '$wallet.example.com/this-has-weight-six#6',
    '$wallet.example.com/this-has-weight-seven#7',
  ])
  .start();
```

#### Relative weight revenue sharing 🆕

As of Webfunding.js 0.1.2, you can use fixed percentage based weight to calculate revenue sharing between a few parties.

One example of this is how a blogging platform provides a revenue sharing scheme for authors and their contributors (editors, proofreaders, etc), but it wants 20% of total revenue brought by Web Monetization API. The obvious way to do it is to roll 20% chance for platform's payment pointer before the actual revenue sharing happens; but what happens when the platform want to introduce other parties that also would get fixed chance for the revenue sharing, say, for affiliate referrers?

Webfunding.js provides a simple way to do it:

```html
<script type="module">
  import { fund } from '/dist/webfunding.mjs'

  import { WebMonetization } from 'webfunding'

  const money = new WebMonetization()
    .registerPaymentPointers([
      '$wallet.example.com/this-has-weight-ten#10',
      '$wallet.example.com/this-has-weight-six#6',
      // the last person will get 20% of revenue
      '$wallet.example.com/this-has-weight-seven#20%',
    ])
    .start();
</script>
```

In the example above, there are six different contributors (including the author) directly involved in working in one content. Notice that payment pointer for `$wallet.example.com/platform` and `$wallet.example.com/affiliate-referrer` both have `%` following the weight of their shares; what will happen is both of them will take 30% (20% for platform and 10% for referrer) of Web Monezitation revenue while split the rest of 70% shares to six contributors. 

## ⚠️ Disclaimer

Webfunding.js is still in early phase development and thus API might change a lot! Not ready for production. Use scripts from `dist` folder in the repo if you want to play with it locally.
