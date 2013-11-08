//
// Cryptii
// Conversion
// Atbash format
//

(function($, cryptii) {
	
	"use strict";

	var format = {

		title: 'Atbash Latin',
		category: 'Cipher',
		url: 'http://en.wikipedia.org/wiki/Atbash',

		convertDecimal: function(decimal)
		{
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
			run: function(conversion, options)
			{
				var formatDef = cryptii.conversion.formats['atbash'];
				conversion.isSplittedContentConversion = true;

				for (var i = 0; i < conversion.content.length; i ++)
				{
					var content = conversion.content[i];
					var decimal = formatDef.convertDecimal(ord(content));

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
			run: function(conversion, options)
			{
				var formatDef = cryptii.conversion.formats['atbash'];

				for (var i = 0; i < conversion.splittedContent.length; i ++)
				{
					var entry = conversion.splittedContent[i];

					if (entry.decimal != null)
					{
						var decimal = formatDef.convertDecimal(entry.decimal);

						// if conversion valid, use the result
						//  if not use the original letter
						entry.result = (decimal != -1 ? chr(decimal) : chr(entry.decimal));
					}
				}
			}
		}

	};

	// register format
	cryptii.conversion.registerFormat('atbash', format);

})($, cryptii);
