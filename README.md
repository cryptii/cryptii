# cryptii

[![Build Status](https://travis-ci.org/cryptii/cryptii.svg?branch=dev)](https://travis-ci.org/cryptii/cryptii)
[![Documentation](https://v4.cryptii.com/docs/badge.svg)](https://v4.cryptii.com/docs/)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![MIT license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE.md)

Modular online encoding, encryption and conversion tool and framework.

## Build

- Make sure you have [node & npm](https://nodejs.org/) and [gulp](http://gulpjs.com/) installed locally.
- Clone the repo: `git clone -b dev git@github.com:cryptii/cryptii.git`
- Install dev dependencies: `npm install`
- Build repo: `gulp build`
- Run tests: `gulp test`
- Watch files: `gulp`

## Core concepts

This framework and web app tries to reflect a wide variety of ciphers, formats, algorithms and methods (called 'bricks') while keeping them easily combinable. There are two categories of bricks: encoders and viewers.

### Encoders

Encoders manipulate content by encoding or decoding it in a specific way and with given settings.

| Name | Category | Description |
| ---- | -------- | ----------- |
| `text-transform` | Transform | Transforming character case and arrangement |
| `numeral-system` | Transform | Translates numerals between systems |
| `spelling-alphabet` | Alphabets | Several [spelling alphabets](https://en.wikipedia.org/wiki/Spelling_alphabet) |
| `affine-cipher` | Simple Substitution | [Affine Cipher](https://en.wikipedia.org/wiki/Affine_cipher) |
| ↳ `caesar-cipher` | Simple Substitution | [Caesar cipher](https://en.wikipedia.org/wiki/Caesar_cipher) |
| ↳ `atbash` | Simple Substitution | [Atbash](https://en.wikipedia.org/wiki/Atbash) using latin or hebrew alphabet |
| `rot13` | Simple Substitution | [ROT13](https://en.wikipedia.org/wiki/ROT13) incl. variants ROT5, ROT18 & ROT47 |
| `vigenere-cipher` | Simple Substitution | [Vigenère cipher](https://en.wikipedia.org/wiki/Vigen%C3%A8re_cipher) |
| `enigma` | Cipher machines | [Enigma machine](https://en.wikipedia.org/wiki/Enigma_machine) |
| `unicode-code-points` | Encoding | Encoding to Unicode code points in given format |
| `base64` | Encoding | [Base64](https://en.wikipedia.org/wiki/Base64) incl. variants base64url, … |
| `morse-code` | Encoding | [Morse code](https://en.wikipedia.org/wiki/Morse_code) (English) |
| `hash` | Modern cryptography | Creating a [message digest](https://en.wikipedia.org/wiki/Cryptographic_hash_function) |

Example usage in code:

```javascript
let encoder = new ROT13Encoder()
encoder.setSettingValue('variant', 'rot47')
let result = encoder.encode('Hello World') // returns a Chain object
result.getString() // returns 'w6==@ (@C=5'
```

### Viewers

Viewers allow users to view and edit content in a specific way or format.

| Name | Category | Description |
| ---- | -------- | ----------- |
| `text` | View | Viewing and editing in plain text |
| `bytes` | View | Viewing and editing bytes |

### Chains

Chain objects encapsulate the actual content used and returned by encoders and viewers. This content can either be a string, an array of Unicode code points or a `Uint8Array` of bytes.

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
