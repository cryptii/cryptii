//
// Cryptii
// Conversion
// Vigenère Cipher
// Based on Caesar Cipher
//

(function($, cryptii) {
	
	"use strict";

	var format = {

		title: 'Vigenère Cipher',
		category: 'Cipher',
		url: 'https://en.wikipedia.org/wiki/Vigen%C3%A8re_cipher',


		validateKey: function(key)
		{
			var isValid = true;
			key = key.toUpperCase();

			var i = 0;

			while (i < key.length && isValid)
			{
				var decimal = ord(key[i]);

				// check if key has only alphabetic letters
				isValid = (decimal >= 65 && decimal <= 90);

				i ++;
			}

			return isValid;

		},

		interpret: {
			options: {
				key: {
					title: 'Key',
					type: 'text',
					default: 'cryptii'
				}
			},
			run: function(conversion, options)
			{
				var formatDefinition = cryptii.conversion.formats['vigenere'];
				var caesarFormatDefinition = cryptii.conversion.formats['caesar'];
				var key = options.key.toUpperCase();

				conversion.isSplittedContentConversion = true;

				if (formatDefinition.validateKey(key))
				{
					for (var i = 0; i < conversion.content.length; i ++)
					{
						var content = conversion.content[i].toUpperCase();
						var shift = ord(key[i % key.length]) - 65;
						var decimal = caesarFormatDefinition.shiftDecimal(
							ord(content), shift);

						if (decimal != -1)
							conversion.splittedContent.push({
								content: content,
								decimal: decimal,
								result: null,
								resultHtml: null
							});
					}
				}
			}
		},

		convert: {
			options: {
				key: {
					title: 'Key',
					type: 'text',
					default: 'cryptii'
				}
			},
			run: function(conversion, options)
			{
				var formatDefinition = cryptii.conversion.formats['vigenere'];
				var caesarFormatDefinition = cryptii.conversion.formats['caesar'];
				var key = options.key.toUpperCase();
				
				if (formatDefinition.validateKey(key))
				{
					for (var i = 0; i < conversion.splittedContent.length; i ++)
					{
						var entry = conversion.splittedContent[i];

						if (entry.decimal != null)
						{
							var shift = ord(key[i % key.length]) - 65;
							var decimal = caesarFormatDefinition.shiftDecimal(
								entry.decimal, - shift);

							if (decimal != -1)
								entry.result = chr(decimal);
						}
					}
				}
			}
		}

	};

	// register format
	cryptii.conversion.registerFormat('vigenere', format);

})($, cryptii);
