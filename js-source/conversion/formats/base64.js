//
// Cryptii
// Conversion
// Base64 format
//

(function($, cryptii) {
	
	"use strict";

	var format = {

		title: 'Base64',
		category: 'Encoding',
		url: 'http://en.wikipedia.org/wiki/Base64',

		alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

		interpret: {
			options: {

			},
			run: function(conversion, options)
			{
				var alphabet = cryptii.conversion.formats['base64'].alphabet;

				// the resulting text can be splitted content converted
				conversion.isSplittedContentConversion = true;

				var content = conversion.content;
				var text = '';
	
				var base64Pattern = /[^A-Za-z0-9\+\/\=]/g;
				if (base64Pattern.exec(content))
					// cancel conversion
					// leave result null
					return;
				
				content = content.replace(base64Pattern, "");
	
				var i = 0;
				do {
					var enc1 = alphabet.indexOf(content.charAt(i++));
					var enc2 = alphabet.indexOf(content.charAt(i++));
					var enc3 = alphabet.indexOf(content.charAt(i++));
					var enc4 = alphabet.indexOf(content.charAt(i++));
					var chr1 = (enc1 << 2) | (enc2 >> 4);
					var chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
					var chr3 = ((enc3 & 3) << 6) | enc4;

					text += String.fromCharCode(chr1);
					if (enc3 != 64)
						text += String.fromCharCode(chr2);
					if (enc4 != 64)
						text += String.fromCharCode(chr3);
	
				} while (i < content.length);

				text = unescape(text);
				// fill splitted content table
				for (var i = 0; i < text.length; i ++)
					conversion.splittedContent.push({
						content: text[i],
						decimal: ord(text[i]),
						result: null
					});
			}
		},

		convert: {
			options: {

			},
			run: function(conversion, options)
			{
				var alphabet = cryptii.conversion.formats['base64'].alphabet;

				// this can't be splitted content converted
				conversion.isSplittedContentConversion = false;

				// convert content to text
				var text = cryptii.conversion.convert(
					conversion.content, {
						interpret: conversion.options.interpret,
						convert: { format: 'text' }
					}).result;

				// escape text
				text = escape(text);
				// reset
				conversion.result = '';
				var i = 0;
				// translate to base64
				do {
					var chr1 = text.charCodeAt(i++);
					var chr2 = text.charCodeAt(i++);
					var chr3 = text.charCodeAt(i++);
					var enc1 = chr1 >> 2;
					var enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
					var enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
					var enc4 = chr3 & 63;
					if (isNaN(chr2))
						enc3 = enc4 = 64;
					else if (isNaN(chr3))
						enc4 = 64;
					// add chars to result
					conversion.result += alphabet.charAt(enc1)
						+ alphabet.charAt(enc2)
						+ alphabet.charAt(enc3)
						+ alphabet.charAt(enc4);

				} while (i < text.length);
			}
		}

	};

	// register format
	cryptii.conversion.registerFormat('base64', format);

})($, cryptii);
