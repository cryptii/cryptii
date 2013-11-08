//
// Cryptii
// Conversion
// Binary format
//

(function($, cryptii) {
	
	"use strict";

	var format = {

		title: 'Binary',
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
					var decimal = parseInt(entry.content, 2);

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
					var decimal = entry.decimal;

					if (decimal < 0)
						decimal = 0xFFFFFFFF + decimal + 1;

					// convert decimal to binary
					var binary = parseInt(decimal, 10).toString(2);
					if (!isNaN(binary))
					{
						// fill up bytes if requested
						if (options.fillUpBytes)
							while (binary.length < 8)
								binary = '0' + binary;
							
						// store
						entry.result = binary;
					}
				}
			}
		}

	};

	// register format
	cryptii.conversion.registerFormat('binary', format);

})($, cryptii);
