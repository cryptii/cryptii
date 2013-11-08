//
// Cryptii
// Conversion
// Pigpen cipher format
//

(function($, cryptii) {
	
	"use strict";

	var format = {

		title: 'Pigpen cipher',
		category: 'Cipher',
		url: 'http://en.wikipedia.org/wiki/Pigpen_cipher',

		convert: {
			options: {

			},
			run: function(conversion, options)
			{
				// this is not a text based output
				conversion.isTextBasedOutput = false;

				for (var i = 0; i < conversion.splittedContent.length; i ++)
				{
					var entry = conversion.splittedContent[i];
					if (entry.decimal == null)
						return null;

					// uppercase letters
					if (entry.decimal >= 97 && entry.decimal <= 122)
						entry.decimal -= 32;
					
					// check if a pigpen symbol exists for this decimal
					if (entry.decimal >= 65 && entry.decimal <= 90)
						entry.result = 'p' + chr(entry.decimal);
					else entry.result = chr(entry.decimal);
				}
			}
		}

	};

	// register format
	cryptii.conversion.registerFormat('pigpen', format);

})($, cryptii);
