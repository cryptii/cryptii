//
// Cryptii
// Conversion
// Roman numerals
//

(function($, cryptii) {
	
	"use strict";

	var format = {

		title: 'Roman numerals',
		category: 'Numeric',
		url: 'https://en.wikipedia.org/wiki/Roman_numerals',

		romanNumerals: {
			   1: 'I',
			   4: 'IV',
			   5: 'V',
			   9: 'IX',
			  10: 'X',
			  40: 'XL',
			  50: 'L',
			  90: 'XC',
			 100: 'C',
			 400: 'CD',
			 500: 'D',
			 900: 'CM',
			1000: 'M'
		},

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
					var formatDef = cryptii.conversion.formats['roman-numerals'];
					var romanNumerals = formatDef.romanNumerals;

					var entry = conversion.splittedContent[i];
					var content = entry.content;

					if (content.length > 0)
					{
						var error = false;
						var decimal = 0;
						var previousHighestRomanNumeral = 1001;

						do
						{
							// find the highest roman numeral with the highest
							//  decimal value that is taken from the left
							//  part of the roman numeral
							var highestRomanNumeral = 0;

							for (var romanNumeral in romanNumerals)
							{
								var written = romanNumerals[romanNumeral];
								if (content.substr(0, written.length) == written)
									highestRomanNumeral =
										Math.max(highestRomanNumeral, romanNumeral);
							}

							if (highestRomanNumeral != 0
								&& highestRomanNumeral <= previousHighestRomanNumeral)
							{
								// add roman numeral (digit) to result
								decimal += highestRomanNumeral;

								// remove roman digit
								content = content.substr(romanNumerals[highestRomanNumeral].length);

								// update previous highest roman numeral
								previousHighestRomanNumeral = highestRomanNumeral;
							}
							else
							{
								// there is a not-recognized letter
								//  or this roman numeral letter is bigger than the last one
								//  or this roman numeral letter appears for the 4th time
								//  cancel
								error = true;
							}
						}

						// do this until the roman numeral is
						//  completely converted in decimal
						//  or an error occurs
						while (content.length > 0 && !error);

						if (!error)
							entry.decimal = decimal;
					}
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
				var formatDef = cryptii.conversion.formats['roman-numerals'];
				var romanNumerals = formatDef.romanNumerals;

				for (var i = 0; i < conversion.splittedContent.length; i ++)
				{
					var entry = conversion.splittedContent[i];
					
					if (entry.decimal != null

						// this converts only roman numerals from 0 to 3999
						&& entry.decimal > 0
						&& entry.decimal < 3999)
					{
						// collect information
						var decimal = entry.decimal;
						var result = '';

						do
						{
							// find highest roman numeral that is less
							//  or equal to the decimal
							var highestRomanNumeral = 0;

							for (var romanNumeral in romanNumerals)
								if (romanNumeral <= decimal)
									highestRomanNumeral =
										Math.max(highestRomanNumeral, romanNumeral);

							// add roman numeral to result
							result += romanNumerals[highestRomanNumeral];

							// substract roman numeral from our decimal
							decimal -= highestRomanNumeral;
						}

						// do this until the decimal is
						//  completely converted in roman numeral
						while (decimal > 0);

						entry.result = result;
					}
				}
			}
		}

	};

	// register format
	cryptii.conversion.registerFormat('roman-numerals', format);

})($, cryptii);
