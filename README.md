**This version of Cryptii is no longer in active development**.<br>
Find the new repositories here: [Cryptii](https://github.com/Cryptii).

---

Cryptii
=======
Cryptii is an OpenSource web application under the MIT license where you can convert, encode and decode content between different format systems.
This happens fully in your browser using JavaScript, no content will be sent to any kind of server.
In addition, you can download and use this web app offline as described below.
Any feedback appreciated, just leave me a tweet or contribute to this project.

Visit the web application: [http://cryptii.com/](http://cryptii.com/)

## Offline usage
To use Cryptii offline just download or clone this repository to your computer and open the `local.html` file in you browser. Please note that the local version will not be updated automatically, use the online version of Cryptii to be up-to-date.

In case you want to edit and test the application scripts, use the `source.html` file. It includes the uncompressed source scripts from the `source-js` folder.

## URL structure
Cryptii supports reading content, interpret format and convert format with their options from the given URL. This makes it possible for you to generate URLs in third-party applications.

The basic URL structure looks like following ([example link](http://cryptii.com/caesar;shift:12/text/FTUE%20UE%20M%20FQEF%20RAD%20SUFTGN.)):
<pre>
http://cryptii.com/[format];[options]/[format];[options]/[content]
</pre>

| Placeholder  | Description   |
| ------------ | ------------- |
| `format`     | Describes the interpret (first) or convert (second) format. If you want to open the interpret or convert format selection, just replace the format by the magic word *select*. |
| `options`    | Options applied on the given format. Find the option definition for each format in the [format source code](https://github.com/the2f/Cryptii/tree/master/js-source/conversion/formats). Syntax: `[opt]:[val];` |
| `content`     | Url encoded (rawurlencode in php) content. |

## License
The MIT License (MIT)

Copyright (c) 2013 Fränz Friederes <[fraenz@frieder.es](mailto:fraenz@frieder.es)>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
