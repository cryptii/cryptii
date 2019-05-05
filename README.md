# cryptii

[![Build Status](https://travis-ci.org/cryptii/cryptii.svg?branch=dev)](https://travis-ci.org/cryptii/cryptii)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![MIT license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE.md)

Web app and framework offering modular conversion, encoding and encryption. Translations are done client side without any server interaction — [cryptii.com](https://cryptii.com)

## Getting started

Several quick start options are available:

- Use the [latest live version](https://cryptii.com) or [download the latest release](https://github.com/cryptii/cryptii/releases/latest).
- Clone the repo: `git clone git@github.com:cryptii/cryptii.git`
- Install the [node](https://nodejs.org/) version specified in `.nvmrc`.
- Run `npm install` to install the dependencies.
- Run `npm run-script build` to build into the `dist/` folder.
- Run `npm run-script test` to test the source code.
- Run `npm run-script watch` to watch for changes.

## Concepts

This framework and web app tries to reflect a wide variety of ciphers, formats, algorithms and methods (called 'bricks') while keeping them easily combinable. There are two categories of bricks: encoders and viewers.

### Encoders

Encoders manipulate content by encoding or decoding it in a specific way and using specific settings.

| Name | Category | Description |
| ---- | -------- | ----------- |
| `reverse` | Transform | Reverses the order of bytes, characters or lines |
| `case-transform` | Transform | Transforms to upper case, lower case, … |
| `numeral-system` | Transform | Translates numerals between systems |
| `bitwise-operation` | Transform | [Bitwise operations](https://en.wikipedia.org/wiki/Bitwise_operation) (NOT, AND, OR, …) |
| `morse-code` | Alphabets | [Morse code](https://en.wikipedia.org/wiki/Morse_code) (English) |
| `spelling-alphabet` | Alphabets | Several [spelling alphabets](https://en.wikipedia.org/wiki/Spelling_alphabet) |
| `enigma` | Substitution cipher | [Enigma machine](https://en.wikipedia.org/wiki/Enigma_machine) incl. 13 models |
| `caesar-cipher` | Substitution cipher | [Caesar cipher](https://en.wikipedia.org/wiki/Caesar_cipher) |
| `affine-cipher` | Substitution cipher | [Affine Cipher](https://en.wikipedia.org/wiki/Affine_cipher) |
| `rot13` | Substitution cipher | [ROT13](https://en.wikipedia.org/wiki/ROT13) incl. variants ROT5, ROT18 & ROT47 |
| `a1z26` | Substitution cipher | Number to letter encoder (A1Z26) |
| `vigenere-cipher` | Substitution cipher | [Vigenère cipher](https://en.wikipedia.org/wiki/Vigen%C3%A8re_cipher) incl. [Beaufort cipher](https://en.wikipedia.org/wiki/Beaufort_cipher) variants |
| `polybius-square` | Substitution cipher | [Polybius square](https://en.wikipedia.org/wiki/Polybius_square) |
| ↳ `bifid-cipher` | Substitution cipher | [Bifid cipher](https://en.wikipedia.org/wiki/Bifid_cipher) |
| `alphabetical-substitution` | Substitution cipher | [Alphabetical substitution](https://en.wikipedia.org/wiki/Substitution_cipher#Simple_substitution) |
| `base32` | Encoding | [Base32](https://en.wikipedia.org/wiki/Base32) incl. variants base32hex, z-base-32, … |
| `base64` | Encoding | [Base64](https://en.wikipedia.org/wiki/Base64) incl. variants base64url, … |
| `ascii85` | Encoding | [Ascii85 / Base85](https://en.wikipedia.org/wiki/Ascii85) incl. variant [Z85](https://rfc.zeromq.org/spec:32/Z85/) |
| `unicode-code-points` | Encoding | Encoding to Unicode code points in given format |
| `url-encoding` | Encoding | [URL encoding / Percent-encoding](https://en.wikipedia.org/wiki/Percent-encoding) |
| `bootstring` | Encoding | [Bootstring](https://tools.ietf.org/html/rfc3492) |
| ↳ `punycode` | Encoding | [Punycode](https://tools.ietf.org/html/rfc3492) |
| `integer` | Encoding | Translates between bytes and [integers](https://en.wikipedia.org/wiki/Integer_(computer_science)) |
| `rc4` | Modern cryptography | [RC4](https://en.wikipedia.org/wiki/RC4) incl. RC4-drop |
| `block-cipher` | Modern cryptography | [Block ciphers](https://en.wikipedia.org/wiki/Block_cipher) incl. [AES](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard) |
| `hash` | Modern cryptography | Creating a [message digest](https://en.wikipedia.org/wiki/Cryptographic_hash_function) |
| ↳ `hmac` | Modern cryptography | Creating a [Hash-based message authentication code](https://en.wikipedia.org/wiki/Hash-based_message_authentication_code) |

Example usage:

```javascript
const bricks = cryptii.BrickFactory.getInstance()
const encoder = bricks.create('rot13')
encoder.setSettingValue('variant', 'rot47')
const result = encoder.encode('Hello World') // returns a Chain object
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
const a = new cryptii.Chain('🦊🚀')
const b = new cryptii.Chain([129418, 128640])
const c = new cryptii.Chain(new Uint8Array([240, 159, 166, 138, 240, 159, 154, 128]))
cryptii.Chain.isEqual(a, b, c) // returns true
```

The object handles the translation between these representations lazily for you. You can access any of these through getter and additional convenience methods.

```javascript
const string = chain.getString()
const codePoints = chain.getCodePoints()
const bytes = chain.getBytes()
```

## Changelog

See [the Releases section of the GitHub repository](https://github.com/cryptii/cryptii/releases) for changelogs for each release version of cryptii.
