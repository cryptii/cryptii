//
// Cryptii
// Conversion
// Octal format
//

(function($, cryptii) {
	
	"use strict";

	var format = {

		title: 'Octal',
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
					var decimal = parseInt(entry.content, 8);

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
				}
			},
			run: function(conversion, options)
			{
				for (var i = 0; i < conversion.splittedContent.length; i ++)
				{
					var entry = conversion.splittedContent[i];
					
					if (entry.decimal != null)
						// convert decimal to octal
						entry.result = entry.decimal.toString(8);
				}
			}
		}

	};

	// register format
	cryptii.conversion.registerFormat('octal', format);

})($, cryptii);
