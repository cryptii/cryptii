//
// Cryptii
// Conversion
// Caesar format
//

(function($, cryptii) {
	
	"use strict";

	var format = {

		title: 'Caesar Cipher',
		category: 'Cipher',
		url: 'http://en.wikipedia.org/wiki/Caesar_cipher',

		convertDecimal: function(decimal, shift)
		{
			// convert single decimal block
			shift = shift % 26;

			// don't shift spaces
			if (decimal == 32 || decimal == 10)
				return decimal;

			// to uppercase
			if (decimal > 90)
				decimal -= 32;

			// shift decimal
			var resultDecimalValue = decimal - shift;

			// limits
			if (resultDecimalValue < 65)
				resultDecimalValue += 26;
			if (resultDecimalValue > 90)
				resultDecimalValue -= 26;

			// check if it is alphabetic
			if (decimal >= 65 && decimal <= 90)
				return resultDecimalValue;

			return -1;
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

				if (!isNaN(shift))
				{
					conversion.isSplittedContentConversion = true;

					for (var i = 0; i < conversion.content.length; i ++)
					{
						var content = conversion.content[i];
						var decimal = formatDefinition.convertDecimal(ord(content), -shift);

						if (decimal == -1)
							decimal = ord(content);

						conversion.splittedContent.push({
							content: content,
							decimal: decimal,
							result: null
						});
					}
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
				
				if (!isNaN(shift))
				{
					for (var i = 0; i < conversion.splittedContent.length; i ++)
					{
						var entry = conversion.splittedContent[i];

						if (entry.decimal != null)
						{
							var decimal = formatDefinition.convertDecimal(
								entry.decimal, shift);

							// if conversion valid, use the result
							//  if not use the original letter
							entry.result = (decimal != -1 ? chr(decimal) : chr(entry.decimal));
						}
					}
				}
			}
		}

	};

	// register format
	cryptii.conversion.registerFormat('caesar', format);

})($, cryptii);
