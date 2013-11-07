//
// Cryptii
// Conversion
// SHA-1 format
//

(function($, cryptii) {
	
	"use strict";

	cryptii.conversion.formats['sha1'] = {

		title: 'SHA-1',
		category: 'Hash',
		url: 'http://en.wikipedia.org/wiki/SHA-1',

		convert: {
			options: {

			},
			run: function(conversion, options) {
				// this can't be splitted content converted
				conversion.isSplittedContentConversion = false;
				// convert content to text
				var text = cryptii.conversion.convert(
					conversion.content, {
						interpret: conversion.options.interpret,
						convert: {
							format: 'text',
							separator: ''
						}
					}).result;
				// convert text to sha1
				conversion.result = sha1(text);
			}
		}

	};

})($, cryptii);
