# cryptii

[![Build Status](https://travis-ci.org/cryptii/cryptii.svg?branch=dev)](https://travis-ci.org/cryptii/cryptii)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![MIT license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE.md)

Web app and framework offering modular conversion, encoding and encryption. Translations are done client side without any server interaction — [cryptii.com](https://cryptii.com)

## Getting started

Quick start options:
- [Use the live version](https://cryptii.com)
- [Download the latest release](https://github.com/cryptii/cryptii/releases/latest)
- Clone the repository: `git clone git@github.com:cryptii/cryptii.git`
- Build using the Node.js version specified in `.nvmrc`: `npm build`

Quick links:
- [Report an issue](https://github.com/cryptii/cryptii/issues/new/choose)
- [Changelog and releases](https://github.com/cryptii/cryptii/releases)
- [Contributing guidelines](CONTRIBUTING.md)
- [Security policy](SECURITY.md)

## Concept

This framework and web app aims to support a wide variety of ciphers, formats, algorithms and methods (called 'Bricks') while keeping them easily combinable. There are currently two types of Bricks: Encoders and Viewers. Encoders manipulate content by encoding or decoding in a specific way and using specific settings while Viewers allow users to access and edit the content fed into or outputted by Encoders in a certain way and format.

Bricks can be arranged inside a Pipe. When the content gets edited inside a Viewer or when Brick settings get changed, the result propagates through the Pipe's Bricks in order and in both directions.

Chain objects encapsulate UTF-8 text or binary based content exchanged between Bricks. They automatically encode or decode the content when combining a text based output with a binary based input and vice-versa.

## Brick library


| Name | Category | Description |
| ---- | -------- | ----------- |
| `a1z26` | Ciphers | Number to letter encoder (A1Z26) |
| `affine-cipher` | Ciphers | [Affine Cipher](https://en.wikipedia.org/wiki/Affine_cipher) |
| `alphabetical-substitution` | Ciphers | [Alphabetical substitution](https://en.wikipedia.org/wiki/Substitution_cipher#Simple_substitution) |
| `ascii85` | Encoding | [Ascii85 / Base85](https://en.wikipedia.org/wiki/Ascii85) incl. variant [Z85](https://rfc.zeromq.org/spec:32/Z85/) |
| `bacon-cipher` | Ciphers | [Bacon's cipher](https://en.wikipedia.org/wiki/Bacon%27s_cipher) |
| `base32` | Encoding | [Base32](https://en.wikipedia.org/wiki/Base32) incl. variants base32hex, z-base-32, … |
| `base64` | Encoding | [Base64](https://en.wikipedia.org/wiki/Base64) incl. variants base64url, … |
| `bitwise-operation` | Transform | [Bitwise operations](https://en.wikipedia.org/wiki/Bitwise_operation) (NOT, AND, OR, …) |
| `block-cipher` | Modern cryptography | [Block ciphers](https://en.wikipedia.org/wiki/Block_cipher) incl. [AES](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard) |
| `bootstring` | Encoding | [Bootstring](https://tools.ietf.org/html/rfc3492) |
| ↳ `punycode` | Encoding | [Punycode](https://tools.ietf.org/html/rfc3492) |
| `bytes` | View | Viewing and editing bytes |
| `caesar-cipher` | Ciphers | [Caesar cipher](https://en.wikipedia.org/wiki/Caesar_cipher) |
| `case-transform` | Transform | Transforms to upper case, lower case, … |
| `enigma` | Ciphers | [Enigma machine](https://en.wikipedia.org/wiki/Enigma_machine) incl. 13 models |
| `hash` | Modern cryptography | Creating a [message digest](https://en.wikipedia.org/wiki/Cryptographic_hash_function) |
| ↳ `hmac` | Modern cryptography | Creating a [Hash-based message authentication code](https://en.wikipedia.org/wiki/Hash-based_message_authentication_code) |
| `integer` | Encoding | Translates between bytes and [integers](https://en.wikipedia.org/wiki/Integer_(computer_science)) |
| `morse-code` | Alphabets | [Morse code](https://en.wikipedia.org/wiki/Morse_code) (English) |
| `numeral-system` | Transform | Translates numerals between systems |
| `polybius-square` | Polybius square | [Polybius square](https://en.wikipedia.org/wiki/Polybius_square) |
| ↳ `adfgx-cipher` | Polybius square | [ADFGX cipher](https://en.wikipedia.org/wiki/ADFGVX_cipher) |
| ↳ `bifid-cipher` | Polybius square | [Bifid cipher](https://en.wikipedia.org/wiki/Bifid_cipher) |
| ↳ `nihilist-cipher` | Polybius square | [Nihilist cipher](https://en.wikipedia.org/wiki/Nihilist_cipher) |
| ↳ `tap-code` | Polybius square | [Tap code](https://en.wikipedia.org/wiki/Tap_code) |
| `rc4` | Modern cryptography | [RC4](https://en.wikipedia.org/wiki/RC4) incl. RC4-drop |
| `replace` | Transform | Finds and replaces a given text |
| `reverse` | Transform | Reverses the order of bytes, characters or lines |
| `rot13` | Ciphers | [ROT13](https://en.wikipedia.org/wiki/ROT13) incl. variants ROT5, ROT18 & ROT47 |
| `spelling-alphabet` | Alphabets | Several [spelling alphabets](https://en.wikipedia.org/wiki/Spelling_alphabet) |
| `text` | View | Viewing and editing in plain text |
| `trifid-cipher` | Polybius square | [Trifid cipher](https://en.wikipedia.org/wiki/Trifid_cipher) |
| `unicode-code-points` | Encoding | Encoding to Unicode code points in given format |
| `url-encoding` | Encoding | [URL encoding / Percent-encoding](https://en.wikipedia.org/wiki/Percent-encoding) |
| `vigenere-cipher` | Ciphers | [Vigenère cipher](https://en.wikipedia.org/wiki/Vigen%C3%A8re_cipher) incl. [Beaufort cipher](https://en.wikipedia.org/wiki/Beaufort_cipher) variants |
