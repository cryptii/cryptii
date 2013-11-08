//
// Cryptii
// Conversion
// Text format
//

(function($, cryptii) {
	
	"use strict";

	var format = {

		title: 'Text',
		category: 'Alphabet',
		url: 'http://en.wikipedia.org/wiki/ASCII',

		interpret: {
			options: {
				
			},
			run: function(conversion, options)
			{
				conversion.isSplittedContentConversion = true;

				for (var i = 0; i < conversion.content.length; i ++)
				{
					var content = conversion.content[i];

					// translate each letter to decimal
					conversion.splittedContent.push({
						content: content,
						decimal: ord(content),
						result: null
					});
				}
			}
		},

		convert: {
			options: {
				transform: {
					title: 'Transform',
					type: 'select',
					options: {
						'none': 'None',
						'uppercase': 'Uppercase letters',
						'lowercase': 'Lowercase letters'
					},
					default: 'none'
				}
			},
			run: function(conversion, options)
			{
				for (var i = 0; i < conversion.splittedContent.length; i ++)
				{
					var entry = conversion.splittedContent[i];

					// translate each decimal to letters
					if (entry.decimal != null)
					{
						var result = chr(entry.decimal);

						// transform if requested
						if (options.transform == 'uppercase')
							result = result.toUpperCase();
						else if (options.transform == 'lowercase')
							result = result.toLowerCase();

						entry.result = result;
					}
				}
			}
		}

	};

	// register format
	cryptii.conversion.registerFormat('text', format);

})($, cryptii);
