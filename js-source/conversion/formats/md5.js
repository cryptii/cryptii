//
// Cryptii
// Conversion
// MD5 format
//

(function($, cryptii) {
	
	"use strict";

	var format = {

		title: 'MD5',
		category: 'Hash',
		url: 'http://en.wikipedia.org/wiki/MD5',

		convert: {
			options: {
				
			},
			run: function(conversion, options)
			{
				// this can't be converted splitted
				conversion.isSplittedContentConversion = false;

				// first convert content to text
				var text = cryptii.conversion.convert(
					conversion.content, {
						interpret: conversion.options.interpret,
						convert: { format: 'text' }
					}).result;
				
				// convert text to md5
				//  using php.js library
				conversion.result = md5(text);
			}
		}

	};

	// register format
	cryptii.conversion.registerFormat('md5', format);

})($, cryptii);
