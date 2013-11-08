//
// Cryptii
// Conversion
// Morsecode format
//

(function($, cryptii) {
	
	"use strict";

	var format = {

		title: 'Morsecode',
		category: 'Alphabet',
		url: 'http://en.wikipedia.org/wiki/Morsecode',

		alphabet: {
			'a': 'SL',
			'b': 'LSSS',
			'c': 'LSLS',
			'd': 'LSS',
			'e': 'S',
			'f': 'SSLS',
			'g': 'LLS',
			'h': 'SSSS',
			'i': 'SS',
			'j': 'SLLL',
			'k': 'LSL',
			'l': 'SLSS',
			'm': 'LL',
			'n': 'LS',
			'o': 'LLL',
			'p': 'SLLS',
			'q': 'LLSL',
			'r': 'SLS',
			's': 'SSS',
			't': 'L',
			'u': 'SSL',
			'v': 'SSSL',
			'w': 'SLL',
			'x': 'LSSL',
			'y': 'LSLL',
			'z': 'LLSS',
			'0': 'LLLLL',
			'1': 'SLLLL',
			'2': 'SSLLL',
			'3': 'SSSLL',
			'4': 'SSSSL',
			'5': 'SSSSS',
			'6': 'LSSSS',
			'7': 'LLSSS',
			'8': 'LLLSS',
			'9': 'LLLLS',
			'à': 'SLLSL',
			'ä': 'SLSL', 
			'è': 'SLSSL',
			'é': 'SSLSS',
			'ö': 'LLLS', 
			'ü': 'SSLL',
			'ß': 'SSSLLSS',
			'S': 'SLSLSL',
			',': 'LLSSLL',
			':': 'LLLSSS',
			';': 'LSLSLS',
			'?': 'SSLLSS',
			'&': 'SLSSS',
			'$': 'SSSLSSL',
			'L': 'LSSSSL',
			'_': 'SSLLSL',
			'(': 'LSLLS',
			')': 'LSLLSL',
			'\'': 'SLLLLS',
			'"': 'SLSSLS',
			'=': 'LSSSL',
			'+': 'SLSLS',
			'/': 'LSSLS',
			'@': 'SLLSLS',
			' ': 'E'
		},

		replaceAll: function(source, find, replace) {
			if (find == '.')
				return source.replace(/\./g, replace);
			return source.replace(new RegExp(find, "g"), replace);
		},

		interpret: {
			options: {
				separator: {
					title: 'Separator',
					type: 'text',
					default: ' '
				},
				longChar: {
					title: 'Long',
					type: 'text',
					default: '-'
				},
				shortChar: {
					title: 'Short',
					type: 'text',
					default: '.'
				},
				spaceChar: {
					title: 'Space',
					type: 'text',
					default: '/'
				}
			},
			run: function(conversion, options)
			{
				var formatDef = cryptii.conversion.formats['morsecode'];
				var alphabet = formatDef.alphabet;
				var flippedAlphabet = {};

				// flip morse code alphabet
				for (var key in alphabet)
					flippedAlphabet[alphabet[key]] = key;

				// translate
				for (var i = 0; i < conversion.splittedContent.length; i ++)
				{
					var entry = conversion.splittedContent[i];
					var key = entry.content.toLowerCase();

					key = formatDef.replaceAll(key, options.longChar, 'L');
					key = formatDef.replaceAll(key, options.shortChar, 'S');
					key = formatDef.replaceAll(key, options.spaceChar, 'E');

					if (flippedAlphabet[key] != undefined)
						entry.decimal = ord(flippedAlphabet[key].toLowerCase());
				}
			}	
		},

		convert: {
			options: {
				separator: {
					title: 'Separator',
					type: 'text',
					default: ' '
				},
				longChar: {
					title: 'Long',
					type: 'text',
					default: '-'
				},
				shortChar: {
					title: 'Short',
					type: 'text',
					default: '.'
				},
				spaceChar: {
					title: 'Space',
					type: 'text',
					default: '/'
				}
			},
			run: function(conversion, options)
			{
				var formatDef = cryptii.conversion.formats['morsecode'];
				var alphabet = formatDef.alphabet;

				// translate
				for (var i = 0; i < conversion.splittedContent.length; i ++)
				{
					var entry = conversion.splittedContent[i];

					if (entry.decimal != null)
					{
						var key = chr(entry.decimal).toLowerCase();

						if (alphabet[key] != undefined)
						{
							var result = alphabet[key];

							result = formatDef.replaceAll(result, 'L', options.longChar);
							result = formatDef.replaceAll(result, 'S', options.shortChar);
							result = formatDef.replaceAll(result, 'E', options.spaceChar);

							entry.result = result;
						}
					}
				}
			}
		}

	};

	// register format
	cryptii.conversion.registerFormat('morsecode', format);

})($, cryptii);
