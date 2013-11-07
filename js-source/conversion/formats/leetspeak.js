//
// Cryptii
// Conversion
// Leetspeak format
//

(function($, cryptii) {
	
	"use strict";

	cryptii.conversion.formats['leetspeak'] = {

		title: 'Leetspeak',
		category: 'Alphabet',
		url: 'http://en.wikipedia.org/wiki/Leet',

		alphabet: {
			'a': ['4', '/-\\', '/\\', '@', '^', 'λ', '∂', 'q', 'α'],
			'b': ['|3', '8', '|o', 'ß', 'l³', '|>', '13', 'J3'],
			'c': ['(', '[', '<', '©', '¢'],
			'd': ['|)', '|]', 'o|', '|>', '<|', 'Ð', 'đ', '1)'],
			'e': ['3', '€', '&', '£', 'ε'],
			'f': ['|=', 'PH', 'ƒ', '|"', 'l²'],
			'g': ['6', '9', '&'],
			'h': ['4', '|-|', '#', '}{', ']-[', '/-/', ')-('],
			'i': ['l', '1', '|', '!', '][', 'ỉ'],
			'j': ['_|', '¿'],
			'k': ['|<', '|{', '|(', 'X'],
			'l': ['1', '|_', '£', '|', '1', '][_'],
			'm': ['|\\/|', '/\\/\\', '|\'|\'|', '/v\\', ']V[', 'AA', '[]V[]', '|11', '/|\\', '^^', '(V)', '|Y|'],
			'n': ['|\\|', '/\\/', '/|/', '/V', '|V', '/\\\\/', '|1', '2', '?', '(\\)', '11', 'r'],
			'o': ['0', '9', '()', '[]', '*', '°', '<>', 'ø', '{[]}'],
			'p': ['9', '|°', 'p', '|>', '|*', '|2', '|D', '][D', '|²', '|?'],
			'q': ['(,)', 'kw', '0_', '0,'],
			'r': ['2', '|2', '1²', '®', '|Z', '|?', '?', 'я', '12', '.-'],
			's': ['5', '$', '§', '?', 'ŝ', 'ş'],
			't': ['+', '\'][\'', '7', '†', '|'],
			'u': ['|_|', 'µ' , '[_]' , 'v'],
			'v': ['|/', '\\|', '\\/', '\\\''],
			'w': ['\\/\\/', '\\|\\|', '|/|/', '\\|/', 'VV', '\\A/', '\\\\\'', 'uu', '\\^/', 'uJ'],
			'x': ['><', ')(', '}{', '%', '?', '×', ']['],
			'y': ['`/', '\'/', 'j', '°/', '¥'],
			'z': ['2', '(\\)', 'z', '"/_'],
			'ä': ['43', '°A°', '°4°'],
			'ö': ['03', '°O°'],
			'ü': ['|_|3', '°U°']
		},
		
		convert: {
			options: {
				density: {
					title: 'Density',
					type: 'slider',
					minimum: 0,
					maximum: 100,
					default: 50
				}
			},
			run: function(conversion, options) {
				var alphabet = cryptii.conversion.formats['leetspeak'].alphabet;
				var density = options.density / 100.0;
				// translate
				for (var i = 0; i < conversion.splittedContent.length; i ++) {
					var entry = conversion.splittedContent[i];
					if (entry.decimal != null) {
						var letter = chr(entry.decimal);
						var useLeet = (density > Math.random());
						if (useLeet && alphabet[letter.toLowerCase()] != undefined) {

							var chars = alphabet[letter.toLowerCase()];
							if (typeof chars === 'string')
								// pick this char
								entry.result = chars;
							else
								// pick random one
								entry.result = chars[parseInt(Math.random() * chars.length)];

						} else
							entry.result = letter;
					}
				}
			}
		}

	};

})($, cryptii);
