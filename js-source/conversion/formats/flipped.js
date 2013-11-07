//
// Cryptii
// Conversion
// Flipped format
//

(function($, cryptii) {
	
	"use strict";

	cryptii.conversion.formats['flipped'] = {

		title: 'Flipped',
		category: 'Alphabet',
		url: null,

		convert: {
			options: {

			},
			run: function(conversion, options) {
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

})($, cryptii);
