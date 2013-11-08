//
// Cryptii
// Conversion
// Hexadecimal format
//

(function($, cryptii) {
	
	"use strict";

	var format = {

		title: 'Hexadecimal',
		category: 'Numeric',
		url: 'http://en.wikipedia.org/wiki/ASCII',

		interpret: {
			options: {
				separator: {
					title: 'Separator',
					type: 'text',
					default: ' '
				}
			},
			run: function(conversion, options)
			{
				for (var i = 0; i < conversion.splittedContent.length; i ++)
				{
					var entry = conversion.splittedContent[i];
					var decimal = parseInt(entry.content, 16);

					if (!isNaN(decimal))
						entry.decimal = decimal;
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
				fillUpBytes: {
					title: 'Fill up bytes',
					type: 'boolean',
					default: true
				}
			},
			run: function(conversion, options)
			{
				for (var i = 0; i < conversion.splittedContent.length; i ++)
				{
					var entry = conversion.splittedContent[i];

					if (entry.decimal != null)
					{
						// convert decimal to hexadecimal
						var hexadecimal = entry.decimal.toString(16);

						// fill up bytes if requested
						if (options.fillUpBytes)
							while (hexadecimal.length < 2)
								hexadecimal = '0' + hexadecimal;
						
						// store
						entry.result = hexadecimal;
					}
				}
			}
		}

	};

	// register format
	cryptii.conversion.registerFormat('hexadecimal', format);

})($, cryptii);
