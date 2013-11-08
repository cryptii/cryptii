//
// Cryptii
// Conversion
// Decimal format
//

(function($, cryptii) {
	
	"use strict";

	var format = {

		title: 'Decimal',
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
					var decimal = parseInt(entry.content);

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
						entry.result = entry.decimal;
				}
			}
		}

	};

	// register format
	cryptii.conversion.registerFormat('decimal', format);

})($, cryptii);
