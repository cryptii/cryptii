//
// Cryptii
// Conversion
// HTML Entities format
//

(function($, cryptii) {
	
	"use strict";

	var format = {

		title: 'HTML Entities',
		category: 'Alphabet',
		url: 'http://en.wikipedia.org/wiki/HTML_Entities',

		interpret: {
			options: {

			},
			run: function(conversion, options)
			{
				conversion.isSplittedContentConversion = true;

				// go through the provided content and search for entities
				var content = conversion.content;
				var i = 0;
				while (i < content.length)
				{
					if (content[i] == '&') {
						// read the next entity
						i ++;
						if (content[i] == '#') {
							// read a decimal entity
							i ++;
							var decimal = '';
							while (!isNaN(parseInt(content[i]))
								&& i < content.length) {
								decimal += content[i];
								i ++;
							}
							// add decimal to splitted content
							conversion.splittedContent.push({
								content: '&#' + decimal + ';',
								decimal: decimal,
								result: null
							});
							// is there a closing semicolon
							if (content[i] != ';')
								// jump a step back
								i --;
						} else {
							// read entity name
							var entityName = '';
							while (content[i] != ';'
								&& i < content.length) {
								entityName += content[i];
								i ++;
							}
							// check if entity name is known
							// todo
						}
					} else {
						// add char to splitted content
						conversion.splittedContent.push({
							content: content[i],
							decimal: ord(content[i]),
							result: null
						});
					}
					i ++;
				}
			}
		},
		convert: {
			options: {

			},
			run: function(conversion, options)
			{
				for (var i = 0; i < conversion.splittedContent.length; i ++)
				{
					var entry = conversion.splittedContent[i];
					
					if (entry.decimal != null)
						// compose html entity
						entry.result = '&#' + entry.decimal + ';';
				}
			}
		}

	};

	// register format
	cryptii.conversion.registerFormat('htmlentities', format);

})($, cryptii);
