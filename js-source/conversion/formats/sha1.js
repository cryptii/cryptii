//
// Cryptii
// Conversion
// SHA-1 format
//

(function($, cryptii) {
	
	"use strict";

	var format = {

		title: 'SHA-1',
		category: 'Hash',
		url: 'http://en.wikipedia.org/wiki/SHA-1',

		convert: {
			options: {

			},
			run: function(conversion, options)
			{
				// this can't be splitted content converted
				conversion.isSplittedContentConversion = false;

				// first convert content to text
				var text = cryptii.conversion.convert(
					conversion.content, {
						interpret: conversion.options.interpret,
						convert: { format: 'text' }
					}).result;

				// convert text to sha1
				//  using php.js library
				conversion.result = sha1(text);
			}
		}

	};

	// register format
	cryptii.conversion.registerFormat('sha1', format);

})($, cryptii);
