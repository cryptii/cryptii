//
// Cryptii
// Conversion
// Ita2 format
//

(function($, cryptii) {
	
	"use strict";

	var format = {

		title: 'Baudot-Murray-Code',
		category: 'Cipher',
		url: 'http://en.wikipedia.org/wiki/ITA2',

		codes: {
			'00011': ['a', '-'],
			'11001': ['b', '?'],
			'01110': ['c', ':'],
			'01001': ['d', 'Who\'s there?'],
			'00001': ['e', '3'],
			'01101': ['f', undefined],
			'11010': ['g', undefined],
			'10100': ['h', undefined],
			'00110': ['i', '8'],
			'01011': ['j', '*bell*'],
			'01111': ['k', '('],
			'10010': ['l', ')'],
			'11100': ['m', '.'],
			'01100': ['n', ','],
			'11000': ['o', '9'],
			'10110': ['p', '0'],
			'10111': ['q', '1'],
			'01010': ['r', '4'],
			'00101': ['s', "'"],
			'10000': ['t', '5'],
			'00111': ['u', '7'],
			'11110': ['v', '='],
			'10011': ['w', '2'],
			'11101': ['x', '/'],
			'10101': ['y', '6'],
			'10001': ['z', '+'],
			'01000': ["\n", "\n"],
			'00010': ["\t", "\t"],
			'00100': [' ', ' '],
			'11111': ['letters', 'letters'],
			'11011': ['figures', 'figures']
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
				var ita2Code = cryptii.conversion.formats['ita2'].codes;

				// shift
				var letterShift = true;

				// go through splitted content
				for (var i = 0; i < conversion.splittedContent.length; i ++)
				{
					var entry = conversion.splittedContent[i];
					var row = ita2Code[entry.content];

					if (row != undefined)
					{
						var ita2Entry = row[letterShift ? 0 : 1];

						if (ita2Entry == 'letters')
							letterShift = true;
						else if (ita2Entry == 'figures')
							letterShift = false;
						else
							entry.decimal = ord(ita2Entry);
					}
				}
			}
		},

		convert: {
			options: {
				separator: {
					title: 'Separator (code)',
					type: 'text',
					default: ' '
				},
				paperTape: {
					title: 'Paper tape',
					type: 'boolean',
					default: true
				}
			},
			run: function(conversion, options)
			{
				// conversion settings
				//  ensures the proper output
				conversion.isResultHtmlAvailable = options.paperTape;
				conversion.canHtmlResultBeDisplayedInSelection = false;
				conversion.splittedContentHtmlSeparator = null;

				var ita2Code = cryptii.conversion.formats['ita2'].codes;
				var flippedIta2Code = {};

				for (var code in ita2Code)
				{
					flippedIta2Code[ita2Code[code][0]] = code + 'l';
					flippedIta2Code[ita2Code[code][1]] = code + 'f';
				}

				// shift
				var letterShift = true;

				// go through splitted content
				for (var i = 0; i < conversion.splittedContent.length; i ++)
				{
					var entry = conversion.splittedContent[i];

					if (entry.decimal != null)
					{
						var asciiChar = chr(entry.decimal).toLowerCase();
						var ita2Entry = flippedIta2Code[asciiChar];

						var result = '';
						var resultHtml = [];

						if (ita2Entry != undefined)
						{
							var code = ita2Entry.substr(0, 5);
							var isLetterShift = (ita2Entry.substr(5, 1) == 'l');

							if (isLetterShift != letterShift
								&& (asciiChar != ' ' 
									&& asciiChar != "\t"
									&& asciiChar != "\n"))
							{
								var key = isLetterShift ? 'letters' : 'figures';
								var flagCode = flippedIta2Code[key].substr(0, 5);

								// add letters / figures flag to result
								// text based
								result = flagCode
									+ (result == '' ? conversion.splittedContentSeparator : '');

								// html based
								if (options.paperTape)
									resultHtml.push(
										$(document.createElement('span'))
											.addClass('o-ita2')
											.addClass('o-ita2-' + flagCode)
											.text(flagCode)
									);

								letterShift = isLetterShift;
							}

							// text based
							result += code;

							// html based
							if (options.paperTape)
								resultHtml.push(
									$(document.createElement('span'))
										.addClass('o-ita2')
										.addClass('o-ita2-' + code)
										.text(code)
								);

							// add results to entry
							entry.result = result;
							entry.resultHtml = resultHtml;
						}
					}
				}
			}
		}

	};

	// register format
	cryptii.conversion.registerFormat('ita2', format);

})($, cryptii);
