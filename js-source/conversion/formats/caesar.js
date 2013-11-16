//
// Cryptii
// Conversion
// Caesar Cipher
//

(function($, cryptii) {
	
	"use strict";

	var format = {

		title: 'Caesar Cipher',
		category: 'Cipher',
		url: 'http://en.wikipedia.org/wiki/Caesar_cipher',

		// this shift method is also used by
		//  Vigenère Cipher format
		shiftDecimal: function(decimal, shift)
		{
			// convert single decimal block
			shift = shift % 26;

			// don't shift spaces
			if (decimal == 32 || decimal == 10)
				return decimal;

			// to uppercase
			if (decimal > 90)
				decimal -= 32;

			// check if it is alphabetic
			if (decimal < 65 || decimal > 90)
				return -1;

			// shift decimal
			decimal -= shift;

			// limits
			if (decimal < 65)
				decimal += 26;
			if (decimal > 90)
				decimal -= 26;

			return decimal;
		},

		interpret: {
			options: {
				shift: {
					title: 'Shift',
					type: 'slider',
					minimum: 0,
					maximum: 25,
					default: 3
				}
			},
			run: function(conversion, options)
			{
				var shift = parseInt(options.shift, 10);
				var formatDefinition = cryptii.conversion.formats['caesar'];

				conversion.isSplittedContentConversion = true;

				for (var i = 0; i < conversion.content.length; i ++)
				{
					var content = conversion.content[i];
					var decimal = formatDefinition.shiftDecimal(ord(content), shift);

					// allow non alphabet characters
					decimal = (decimal == -1 ? ord(content) : decimal);

					conversion.splittedContent.push({
						content: content,
						decimal: decimal,
						result: null,
						resultHtml: null
					});
				}
			}
		},

		convert: {
			options: {
				shift: {
					title: 'Shift',
					type: 'slider',
					minimum: 0,
					maximum: 25,
					default: 3
				}
			},
			run: function(conversion, options)
			{
				var shift = parseInt(options.shift, 10);
				var formatDefinition = cryptii.conversion.formats['caesar'];
				
				for (var i = 0; i < conversion.splittedContent.length; i ++)
				{
					var entry = conversion.splittedContent[i];

					if (entry.decimal != null)
					{
						var decimal = formatDefinition.shiftDecimal(
							entry.decimal, -shift);

						// if conversion valid, use the result
						//  if not use the original letter
						entry.result = (decimal != -1 ? chr(decimal) : chr(entry.decimal));
					}
				}
			}
		}

	};

	// register format
	cryptii.conversion.registerFormat('caesar', format);

})($, cryptii);
