
# cryptii

[![MIT license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE.md)

Cryptii is a web app where you can encode and decode content between different formats. This happens fully in your browser using JavaScript, no content will be sent to any kind of server. Please note that the encryption methods offered in this app are very basic and therefore not considered as secure – [cryptii.com](https://cryptii.com/)

## Offline usage
To use this app offline just download or clone this repository and open `local.html` in your browser. Please note that the local version will not be updated automatically, use the online version of Cryptii to be up-to-date.

In case you want to edit and test the application scripts, use the `source.html` file. It includes the uncompressed source scripts from the `source-js` folder.

## URL structure
Cryptii supports reading content, interpret format and convert format with their respective options from a structured URL. This makes it possible for you to generate URLs in third-party applications that create pre-configured Cryptii sessions.

The basic URL structure looks like this: ([example link](http://cryptii.com/caesar;shift:12/text/FTUE%20UE%20M%20FQEF%20RAD%20SUFTGN.))

```
http://cryptii.com/<interpret format>;<options>/<convert format>;<options>/<content>
```

| Placeholder | Description                              |
| ----------- | ---------------------------------------- |
| `format`    | Sets the interpretation and/or conversion format. If you want to open the interpret or convert format selection, replace the format by the magic keyword `select`. |
| `options`   | Sets the options applied on the given interpretation or conversion. Find the option definition for each format in the [source code](https://github.com/cryptii/cryptii/tree/master/js-source/conversion/formats). Syntax: `<option name>:<value>;` |
| `content`   | Url encoded content (use `rawurlencode` in php) |
