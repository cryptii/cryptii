# cryptii

[![Build Status](https://travis-ci.org/cryptii/cryptii.svg?branch=dev)](https://travis-ci.org/cryptii/cryptii)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![MIT license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE.md)

Web app and framework offering modular conversion, encoding and encryption. Translations are done client side without any server interaction — [cryptii.com](https://cryptii.com)

## Getting started

- Use the [live version](https://cryptii.com)
- Download the [latest stable release](https://github.com/cryptii/cryptii/releases/latest) or [other releases](https://github.com/cryptii/cryptii/releases)
- Clone the repository: `git clone git@github.com:cryptii/cryptii.git`
- Ensure you have Node.js of version specified in `.nvmrc` installed
- `npm ci`
- `npm run-script build`
- [Contribute to the project](CONTRIBUTING.md) or [report an issue](https://github.com/cryptii/cryptii/issues/new/choose)

## Concept

This framework and web app aims to support a wide variety of ciphers, formats, algorithms and methods (called 'Bricks') while keeping them easily combinable. There are currently two types of Bricks: Encoders and Viewers. Encoders manipulate content by encoding or decoding in a specific way and using specific settings while Viewers allow users to access and edit the content fed into or outputted by Encoders in a certain way and format.

Bricks can be arranged inside a Pipe. When the content gets edited inside a Viewer or when Brick settings get changed, the result propagates through the Pipe's Bricks in order and in both directions.

Chain objects encapsulate UTF-8 text or binary based content exchanged between Bricks. They automatically encode or decode the content when combining a text based output with a binary based input and vice-versa.

## Brick library

| Name | Category | Description |
| ---- | -------- | ----------- |
| [`a1z26`](https://cryptii.com/pipes/a1z26-cipher) | Ciphers | Number to letter encoder (A1Z26) |
| [`adfgx-cipher`](https://cryptii.com/pipes/adfgvx-cipher) | Polybius square | [ADFGX cipher](https://en.wikipedia.org/wiki/ADFGVX_cipher) |
| [`affine-cipher`](https://cryptii.com/pipes/affine-cipher) | Ciphers | [Affine Cipher](https://en.wikipedia.org/wiki/Affine_cipher) |
| [`alphabetical-substitution`](https://cryptii.com/pipes/alphabetical-substitution) | Ciphers | [Alphabetical substitution](https://en.wikipedia.org/wiki/Substitution_cipher#Simple_substitution) |
| [`ascii85`](https://cryptii.com/pipes/ascii85-encoding) | Encoding | [Ascii85 / Base85](https://en.wikipedia.org/wiki/Ascii85) incl. variant [Z85](https://rfc.zeromq.org/spec:32/Z85/) |
| [`bacon-cipher`](https://cryptii.com/pipes/bacon-cipher) | Ciphers | [Bacon's cipher](https://en.wikipedia.org/wiki/Bacon%27s_cipher) |
| [`base32`](https://cryptii.com/pipes/base32) | Encoding | [Base32](https://en.wikipedia.org/wiki/Base32) incl. variants base32hex, z-base-32, … |
| [`base64`](https://cryptii.com/pipes/text-to-base64) | Encoding | [Base64](https://en.wikipedia.org/wiki/Base64) incl. variants base64url, … |
| [`bifid-cipher`](https://cryptii.com/pipes/bifid-cipher) | Polybius square | [Bifid cipher](https://en.wikipedia.org/wiki/Bifid_cipher) |
| [`bitwise-operation`](https://cryptii.com/pipes/bitwise-calculator) | Transform | [Bitwise operations](https://en.wikipedia.org/wiki/Bitwise_operation) (NOT, AND, OR, …) |
| [`block-cipher`](https://cryptii.com/pipes/aes-encryption) | Modern cryptography | [Block ciphers](https://en.wikipedia.org/wiki/Block_cipher) incl. [AES](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard) |
| [`bootstring`](https://cryptii.com/pipes/bootstring) | Encoding | [Bootstring](https://tools.ietf.org/html/rfc3492) |
| [`bytes`](https://cryptii.com/pipes/text-to-binary) | View | Viewing and editing bytes |
| [`caesar-cipher`](https://cryptii.com/pipes/caesar-cipher) | Ciphers | [Caesar cipher](https://en.wikipedia.org/wiki/Caesar_cipher) |
| [`case-transform`](https://cryptii.com/pipes/convert-case) | Transform | Transforms to upper case, lower case, … |
| [`enigma`](https://cryptii.com/pipes/enigma-machine) | Ciphers | [Enigma machine](https://en.wikipedia.org/wiki/Enigma_machine) incl. 13 models |
| [`hash`](https://cryptii.com/pipes/hash-function) | Modern cryptography | Creating a [message digest](https://en.wikipedia.org/wiki/Cryptographic_hash_function) |
| [`hmac`](https://cryptii.com/pipes/hmac) | Modern cryptography | Creating a [Hash-based message authentication code](https://en.wikipedia.org/wiki/Hash-based_message_authentication_code) |
| [`integer`](https://cryptii.com/pipes/integer-encoder) | Encoding | Translates between bytes and [integers](https://en.wikipedia.org/wiki/Integer_(computer_science)) |
| [`morse-code`](https://cryptii.com/pipes/morse-code-translator) | Alphabets | [Morse code](https://en.wikipedia.org/wiki/Morse_code) (English) |
| [`nihilist-cipher`](https://cryptii.com/pipes/nihilist-cipher) | Polybius square | [Nihilist cipher](https://en.wikipedia.org/wiki/Nihilist_cipher) |
| [`numeral-system`](https://cryptii.com/pipes/roman-numerals) | Transform | Translates numerals between systems |
| [`polybius-square`](https://cryptii.com/pipes/polybius-square) | Polybius square | [Polybius square](https://en.wikipedia.org/wiki/Polybius_square) |
| [`punycode`](https://cryptii.com/pipes/punycode) | Encoding | [Punycode](https://tools.ietf.org/html/rfc3492) |
| [`rc4`](https://cryptii.com/pipes/rc4-encryption) | Modern cryptography | [RC4](https://en.wikipedia.org/wiki/RC4) incl. RC4-drop |
| `replace` | Transform | Finds and replaces a given text |
| [`reverse`](https://cryptii.com/pipes/reverse-text) | Transform | Reverses the order of bytes, characters or lines |
| [`rot13`](https://cryptii.com/pipes/rot13) | Ciphers | [ROT13](https://en.wikipedia.org/wiki/ROT13) incl. variants ROT5, ROT18 & ROT47 |
| [`spelling-alphabet`](https://cryptii.com/pipes/nato-phonetic-alphabet) | Alphabets | Several [spelling alphabets](https://en.wikipedia.org/wiki/Spelling_alphabet) |
| [`tap-code`](https://cryptii.com/pipes/tap-code) | Polybius square | [Tap code](https://en.wikipedia.org/wiki/Tap_code) |
| [`text`](https://cryptii.com/pipes/text-to-binary) | View | Viewing and editing in plain text |
| [`trifid-cipher`](https://cryptii.com/pipes/trifid-cipher) | Polybius square | [Trifid cipher](https://en.wikipedia.org/wiki/Trifid_cipher) |
| [`unicode-code-points`](https://cryptii.com/pipes/unicode-lookup) | Encoding | Encoding to Unicode code points in given format |
| [`url-encoding`](https://cryptii.com/pipes/urlencode) | Encoding | [URL encoding / Percent-encoding](https://en.wikipedia.org/wiki/Percent-encoding) |
| [`vigenere-cipher`](https://cryptii.com/pipes/vigenere-cipher) | Ciphers | [Vigenère cipher](https://en.wikipedia.org/wiki/Vigen%C3%A8re_cipher) incl. [Beaufort cipher](https://en.wikipedia.org/wiki/Beaufort_cipher) variants |

---

This is a project by [Fränz Friederes](https://fraenz.frieder.es/) and [contributors](https://github.com/cryptii/cryptii/graphs/contributors)
