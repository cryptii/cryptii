//
// Cryptii
// Conversion
// MD5 format
//

(function($, cryptii) {
	
	"use strict";

	cryptii.conversion.formats['md5'] = {

		title: 'MD5',
		category: 'Hash',
		url: 'http://en.wikipedia.org/wiki/MD5',

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
				// convert text to md5
				conversion.result = md5(text);
			}
		}

	};

})($, cryptii);
