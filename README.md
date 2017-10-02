# cryptii

[![Build Status](https://travis-ci.org/cryptii/cryptii.svg?branch=dev)](https://travis-ci.org/cryptii/cryptii)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![MIT license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE.md)

Framework and web app for encoding and decoding content.

## Bricks

### Encoders

| Name | Category | Description |
| ---- | -------- | ----------- |
| `text-transform` | Transform | Transforming character case and arrangement |
| `affine-cipher` | Simple Substitution | [Affine Cipher](https://en.wikipedia.org/wiki/Affine_cipher) |
| ↳ `caesar-cipher` | Simple Substitution | [Caesar cipher](https://en.wikipedia.org/wiki/Caesar_cipher) |
| ↳ `atbash` | Simple Substitution | [Atbash](https://en.wikipedia.org/wiki/Atbash) using latin or hebrew alphabet |
| `rot13` | Simple Substitution | [ROT13](https://en.wikipedia.org/wiki/ROT13) incl. variants ROT5, ROT18 & ROT47 |
| `vigenere-cipher` | Simple Substitution | [Vigenère cipher](https://en.wikipedia.org/wiki/Vigen%C3%A8re_cipher) |
| `base64` | Encoding | [Base64](https://en.wikipedia.org/wiki/Base64) incl. variants base64url, … |

### Viewers

| Name | Category | Description |
| ---- | -------- | ----------- |
| `text` | Representation | Viewing and editing in plain text |
| `hash` | Modern cryptography | Showing [message digest](https://en.wikipedia.org/wiki/Cryptographic_hash_function) of current content |

## Quick start

- Make sure you have [node & npm](https://nodejs.org/) and [gulp](http://gulpjs.com/) installed locally.
- Clone the repo: `git clone -b dev git@github.com:cryptii/cryptii.git`
- Install dev dependencies: `npm install`
- Build repo: `gulp build`
- Run tests: `gulp test`
- Watch files: `gulp`

## Core concepts

This framework and web app tries to reflect a wide variety of ciphers, encodings, encryptions and formats while keeping them easily combinable. Here are some basic assumptions that lay out the foundation of this library.

### Bricks

There are two categories of Bricks: Encoders and Viewers. Both inherit directly from the Brick class which provides logic for managing settings, a view and serialisation.

Encoder objects manipulate content by encoding or decoding it in a specific way and with given settings.

```javascript
let encoder = new ROT13Encoder()
encoder.setSettingValue('variant', 'rot47')
let result = encoder.encode('Hello World') // returns a Chain object
result.getString() // returns 'w6==@ (@C=5'
```

Viewer objects allow users to view and edit content in a specific way or format.

### Chains

Chain objects encapsulate the actual content used and returned by Encoders and Viewers. This content can either be a string, an array of Unicode code points or a `Uint8Array` of bytes.

Chains are immutable. You define its content by passing one of these representations as first argument to the constructor.

```javascript
let a = new Chain('🦊🚀')
let b = new Chain([129418, 128640])
let c = new Chain(new Uint8Array([240, 159, 166, 138, 240, 159, 154, 128]))
Chain.isEqual(a, b, c) // returns true
```

The object handles the translation between these representations lazily for you. You can access any of these through getter and additional convenience methods.

```javascript
let string = chain.getString()
let codePoints = chain.getCodePoints()
let bytes = chain.getBytes()
```
