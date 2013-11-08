//
// Cryptii
// Conversion
// ROT13 format
//

(function($, cryptii) {
	
	"use strict";

	// variant option
	var variantOption = {
		title: 'Variant',
		type: 'select',
		options: {
			'rot5': 'ROT5 (digits)',
			'rot13': 'ROT13 (letters)',
			'rot18': 'ROT18 (digits and letters)',
			'rot47': 'ROT47 (all characters)'
		},
		default: 'rot13'
	};

	// format definition
	var format = {

		title: 'ROT13',
		category: 'Cipher',
		url: 'http://en.wikipedia.org/wiki/ROT13',

		convertDecimalToRotVariant: function(decimal, variant)
		{
			if (variant == 'rot5')
			{
				if (decimal >= 48 && decimal <= 57) {
					decimal += 5;

					if (decimal > 57)
						decimal -= 10;
				}
			}
			else if (variant == 'rot13')
			{
				if (decimal >= 97 && decimal <= 122) {
					decimal += 13;

					if (decimal > 122)
						decimal -= 26;

				} else if (decimal >= 65 && decimal <= 90) {
					decimal += 13;

					if (decimal > 90)
						decimal -= 26;
				}
			}
			else if (variant == 'rot18')
			{
				if (decimal >= 65 && decimal <= 90) {
					decimal += 13;

					if (decimal > 90)
						decimal -= 26;

				} else if (decimal >= 97 && decimal <= 122) {
					decimal += 13;

					if (decimal > 122)
						decimal -= 26;

				} else if (decimal >= 48 && decimal <= 57) {
					decimal += 5;

					if (decimal > 57)
						decimal -= 10;
				}
			}
			else if (variant == 'rot47')
			{
				if (decimal >= 33 && decimal <= 126) {
					decimal += 47;

					if (decimal > 126)
						decimal -= 94;
				}
			}

			return decimal;
		},

		interpret: {
			options: {
				variant: variantOption
			},
			run: function(conversion, options)
			{
				var formatDefinition = cryptii.conversion.formats['rot13'];

				conversion.isSplittedContentConversion = true;

				for (var i = 0; i < conversion.content.length; i ++)
				{
					var content = conversion.content[i];
					var decimal = formatDefinition.convertDecimalToRotVariant(
						ord(content), options.variant);

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
				variant: variantOption
			},
			run: function(conversion, options)
			{
				var formatDefinition = cryptii.conversion.formats['rot13'];

				for (var i = 0; i < conversion.splittedContent.length; i ++)
				{
					var entry = conversion.splittedContent[i];

					if (entry.decimal != null)
					{
						var decimal = formatDefinition.convertDecimalToRotVariant(
							entry.decimal, options.variant);
						entry.result = chr(decimal);
					}
				}
			}
		}

	};

	// register format
	cryptii.conversion.registerFormat('rot13', format);

})($, cryptii);
