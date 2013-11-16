//
// Cryptii
// Uglify compression (using node)
//

// Find UglifyJS2 on GitHub
// https://github.com/mishoo/UglifyJS2
var UglifyJS = require('uglify-js');
var fs = require('fs');

// options
var outputFilename = '../js/cryptii.min.js';

// minify files
var result = UglifyJS.minify([

	// third party libraries
	'libraries/phpjs/chr.js',
	'libraries/phpjs/ord.js',
	'libraries/phpjs/sha1.js',
	'libraries/phpjs/md5.js',
	'libraries/phpjs/utf8_encode.js',
	'libraries/phpjs/urlencode.js',
	'libraries/phpjs/urldecode.js',

	// application
	'cryptii.js',

		// view
		'view/view.js',

		// conversion
		'conversion/conversion.js',

			// formats

			// alphabet
			'conversion/formats/text.js',
			'conversion/formats/flipped.js',
			'conversion/formats/htmlentities.js',
			'conversion/formats/morsecode.js',
			'conversion/formats/leetspeak.js',
			'conversion/formats/navajo.js',

			// numeric
			'conversion/formats/decimal.js',
			'conversion/formats/binary.js',
			'conversion/formats/octal.js',
			'conversion/formats/hexadecimal.js',
			'conversion/formats/roman-numerals.js',

			// cipher
			'conversion/formats/atbash.js',
			'conversion/formats/caesar.js',
			'conversion/formats/vigenere.js',
			'conversion/formats/rot13.js',
			'conversion/formats/ita2.js',
			'conversion/formats/pigpen.js',

			// encoding
			'conversion/formats/base64.js',

			// hash
			'conversion/formats/md5.js',
			'conversion/formats/sha1.js'

]);

fs.writeFile(outputFilename, result.code, function(err) {

    if (err) {

        console.log(err);

    } else {

        console.log('Minified version saved to ' + outputFilename);

    }

});
