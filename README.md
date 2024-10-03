# Read the docs [here](https://stayte.vercel.app)

# Introduction

Stayte is a library that helps you to create persistent state in your application by using every possible peristent storage (cookies, query, local storage or session storage) in natural way.

tired to re-invent the wheel at every new project, Stayte is here to help you to save time and effort.

It's inspired by the concept of signal and it's a great fit for React applications, but it can be used in any JavaScript application.

Stayte could also be used in the server side by applying a simple patch (only next.js is supported for now).


## Features

- 🔌 Signal-like
- 💾 Persistent state
- 🔍 Type-Safe
- 📡 SSR Friendly
- 🧪 Fully tested
- 📦 Zod validation

## Inspiration

The name stayte is the concatenation of the words "stay" and "state".

Stayte is inspired by multiple libraries, here is a list of them:

- [Nuqs](https://nuqs.47ng.com)
- [Preact signal](https://preactjs.com/guide/v10/signals)
- [Jotai](https://jotai.org/)

# Concept


## What is a "persistent state" ?

A persistent state is a state that is stored in a place that is not destroyed when the application is closed, like
a page reload or a tab close.

There is many different area that is used to store a peristent state

- [Local storage](https://developer.mozilla.org/fr/docs/Web/API/Window/localStorage) (client)
- [Session storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage) (client)
- [Cookies](https://developer.mozilla.org/fr/docs/Mozilla/Add-ons/WebExtensions/API/cookies) (SSR)
- [Query string](https://developer.mozilla.org/fr/docs/Web/API/URLSearchParams) (SSR)


In many project, as a developer, you will need to interact with a peristent state
by using the native browser API or by using a library

***Problem***, there is no library that regroup all peristent state in one place, with a unified API.

Stayte is here to help you to save time and effort.

## What is a "gluon" ?

A gluon is the smallest unit of stayte, it's a class used to interact with every peristent state.

He's able to ***subscribe*** to changes, ***set*** a value and ***get*** the value.

It's look like a signal from preact

Also a gluon can be composed of other gluons and make a chain of reaction.

:::info
The name "gluon" is inspired by the physical [gluon](https://fr.wikipedia.org/wiki/Gluon), it's a quantum particle that is responsible of the link between the quarks.
:::

# Basic usage

## Declare a gluon

The first way to use staye is to use it in vanilla javascript code.

You declare a gluon by calling the `gluon` funcition and passing the name of the gluon and
the source where the gluon will be persisted or not (memory source)

```js
import { gluon } from "stayte";

const nameGluon = gluon('name', {
  from: <source>
})
```

allowed source are: 

- `query`: The query string of the url
- `cookies`: The cookies of the browser
- `localStorage`: The local storage of the browser
- `sessionStorage`: The session storage of the browser
- `memory`: The memory of the browser