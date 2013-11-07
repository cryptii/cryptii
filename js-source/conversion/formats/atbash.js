//
// Cryptii
// Conversion
// Atbash format
//

(function($, cryptii) {
	
	"use strict";

	cryptii.conversion.formats['atbash'] = {

		title: 'Atbash Latin',
		category: 'Cipher',
		url: 'http://en.wikipedia.org/wiki/Atbash',

		convertDecimal: function(decimal) {
			// convert single decimal block
			// ignore spaces
			if (decimal == 32 || decimal == 10) 
				return decimal;
			// to uppercase
			if (decimal > 90)
				decimal -= 32;
			//check if it is alphabetic
			if (!(decimal >= 65 && decimal <= 90))
				return -1;
			// calculate
			return (25 - (decimal - 65) + 65);
		},

		interpret: {
			options: {

			},
			run: function(conversion, options) {
				conversion.isSplittedContentConversion = true;
				for (var i = 0; i < conversion.content.length; i ++) {
					var content = conversion.content[i];
					var decimal = cryptii.conversion.formats['atbash'].convertDecimal(ord(content));
					if (decimal == -1)
						decimal = ord(content);
					conversion.splittedContent.push({
						content: content,
						decimal: decimal,
						result: null
					});
				}
			}
		},

		convert: {
			options: {

			},
			run: function(conversion, options) {
				for (var i = 0; i < conversion.splittedContent.length; i ++) {
					var entry = conversion.splittedContent[i];
					if (entry.decimal != null) {
						var decimal = cryptii.conversion.formats['atbash'].convertDecimal(
							entry.decimal);
						if (decimal != -1)
							entry.result = chr(decimal);
						else entry.result = chr(entry.decimal);
					}
				}
			}
		}

	};

})($, cryptii);
