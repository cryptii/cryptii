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
				// pigpen cipher can be displayed in the format selection
				conversion.isResultHtmlAvailable = true;
				conversion.canHtmlResultBeDisplayedInSelection = true;

				for (var i = 0; i < conversion.splittedContent.length; i ++)
				{
					var entry = conversion.splittedContent[i];
					var decimal = entry.decimal;
					if (decimal == null)
						return null;

					// uppercase letters
					if (decimal >= 97 && decimal <= 122)
						decimal -= 32;

					var letter = chr(decimal);

					// pass plain text result
					entry.result = letter;
					
					// check if a pigpen symbol exists for this decimal
					if (decimal >= 65 && decimal <= 90)
					{
						// valid pigpen letter
						// calculate left margin in background image
						var left = - (decimal - 65) * 10;

						// prepare html output
						entry.resultHtml = $(document.createElement('span'))
							.addClass('o-pigpen')
							.css({ backgroundPosition: left + 'px 0' })
							.text(letter);
					}
				}
			}
		}

	};

	// register format
	cryptii.conversion.registerFormat('pigpen', format);

})($, cryptii);
