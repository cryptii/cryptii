//
// Cryptii
// Conversion
// Flipped format
//

(function($, cryptii) {
	
	"use strict";

	var format = {

		title: 'Flipped',
		category: 'Alphabet',
		url: null,

		convert: {
			options: {

			},
			run: function(conversion, options)
			{
				// turn off splitted conversion
				conversion.isSplittedContentConversion = false;

				// flip whole content
				var result = '';
				
				for (var i = 0; i < conversion.content.length; i ++)
					result = conversion.content[i] + result;

				conversion.result = result;
			}
		}

	};

	// register format
	cryptii.conversion.registerFormat('flipped', format);

})($, cryptii);
