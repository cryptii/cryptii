//
// Cryptii
// Conversion
//

(function($, cryptii) {
	
	"use strict";

	cryptii.conversion = {

		// attributes
		interpretFormat: null,
		interpretOptions: null,

		convertFormat: null,
		convertOptions: null,

		// format definition
		formats: {},

		init: function() {
			if (cryptii.conversion.interpretFormat == null
				|| cryptii.conversion.convertFormat == null) {
				var interpretFormat = cryptii.options.defaultInterpretFormat;
				var convertFormat = cryptii.options.defaultConvertFormat;
				// apply format
				cryptii.conversion.setInterpretFormat(interpretFormat);
				cryptii.conversion.setConvertFormat(convertFormat);
			}
		},

		registerFormat: function(name, formatDef) {
			cryptii.conversion.formats[name] = formatDef;
		},

		//
		// EVENTS
		//
		inputContentHasChangedEvent: function() {
			cryptii.conversion.launch();
		},
		formatHasChangedEvent: function() {
			cryptii.conversion.launch();
		},
		optionsHasChangedEvent: function() {
			cryptii.conversion.launch();
		},

		//
		// METHODS
		//
		setInterpretFormat: function(format) {
			if (cryptii.conversion.interpretFormat == format)
				// nothing to do.
				return;

			// change actual format
			cryptii.conversion.interpretFormat = format;

			// reset options
			cryptii.conversion.interpretOptions = {};

			// insert default options of this format
			var interpretOptions = cryptii.conversion.formats[format].interpret.options;
			$.each(interpretOptions, function(name, optionDef) {
				cryptii.conversion.interpretOptions[name] = optionDef.default;
			});
			
			// prepare input content for this interpret format
			cryptii.view.setInputContent(
				cryptii.conversion.convertPreviewContent(format, false)
			);

			// update url
			cryptii.view.updateUrl();

			if (cryptii.isInitialized) {
				// fire input content has changed event
				cryptii.conversion.formatHasChangedEvent();
				// activate has format changed flag
				cryptii.view.hasFormatChanged = true;
				// update view
				cryptii.view.updateView();
			}
		},

		getInterpretOptions: function() {
			var format = cryptii.conversion.interpretFormat;
			var options = cryptii.conversion.formats[format].interpret.options;

			$.each(options, function(name, option) {
				option.value = cryptii.conversion.interpretOptions[name];
			});

			return options;
		},

		getInterpretOption: function(name) {
			var options = cryptii.conversion.getInterpretOptions();
			return options[name];
		},

		setInterpretOption: function(name, value) {
			// store option value
			cryptii.conversion.interpretOptions[name] = value;
			// event
			cryptii.conversion.optionsHasChangedEvent();
		},

		setConvertFormat: function(format) {
			if (cryptii.conversion.convertFormat == format)
				// nothing to do.
				return;

			// change actual format
			cryptii.conversion.convertFormat = format;

			// reset options
			cryptii.conversion.convertOptions = {};

			// insert default options of this format
			var convertOptions = cryptii.conversion.formats[format].convert.options;
			$.each(convertOptions, function(name, optionDef) {
				cryptii.conversion.convertOptions[name] = optionDef.default;
			});

			// update url
			cryptii.view.updateUrl();

			if (cryptii.isInitialized) {
				// fire input content has changed event
				cryptii.conversion.formatHasChangedEvent();
				// activate has format changed flag
				cryptii.view.hasFormatChanged = true;
				// update view
				cryptii.view.updateView();
			}
		},

		getConvertOptions: function() {
			var format = cryptii.conversion.convertFormat;
			var options = cryptii.conversion.formats[format].convert.options;

			$.each(options, function(name, option) {
				option.value = cryptii.conversion.convertOptions[name];
			});

			return options;
		},

		getConvertOption: function(name) {
			var options = cryptii.conversion.getConvertOptions();
			return options[name];
		},

		setConvertOption: function(name, value) {
			// store option value
			cryptii.conversion.convertOptions[name] = value;
			// event
			cryptii.conversion.optionsHasChangedEvent();
		},

		getHistoryState: function() {
			// compose url
			var interpretFormat = cryptii.conversion.interpretFormat;
			var convertFormat = cryptii.conversion.convertFormat;
			// check if current state could be pushed
			if (interpretFormat != null
				&& convertFormat != null) {
				// get format definitions and titles
				var interpretFormatDef = cryptii.conversion.formats[interpretFormat];
				var convertFormatDef = cryptii.conversion.formats[convertFormat];
				// push state
				return {
					title: 'Cryptii — ' + interpretFormatDef.title + ' to ' + convertFormatDef.title,
					url: '/' + interpretFormat + '/' + convertFormat
				};
			}

			return null;
		},

		launch: function() {
			// this method launches the actual conversion
			//  from input content to output

			var content = cryptii.view.getInputContent();
			// compose conversion options
			var options = {
				interpret: $.extend({
					format: cryptii.conversion.interpretFormat
				}, cryptii.conversion.interpretOptions),
				convert: $.extend({
					format: cryptii.conversion.convertFormat
				}, cryptii.conversion.convertOptions)
			};
			// convert
			var result = cryptii.conversion.convert(content, options);
			// show result
			cryptii.view.setOutputContent(result);
		},

		convertPreviewContent: function(format, useCurrentInputContent) {

			// collect information
			var inputContent = cryptii.options.defaultInputContent;
			var interpretFormat = 'text';
			var convertFormat = format;

			if (useCurrentInputContent) {
				// use current interpret setting
				inputContent = cryptii.view.getInputContent();
				interpretFormat = cryptii.conversion.interpretFormat;
			}

			// compose conversion options
			var conversionOptions = {
				interpret: {
					format: interpretFormat
				},
				convert: {
					format: convertFormat
				}
			};

			// collect and apply format option defaults
			$.each(cryptii.conversion.formats[interpretFormat].interpret.options, function(name, option) {
				conversionOptions.interpret[name] = option.default;
			});

			$.each(cryptii.conversion.formats[convertFormat].convert.options, function(name, option) {
				conversionOptions.convert[name] = option.default;
			});

			// create sample content
			var content = cryptii.conversion.convert(inputContent, conversionOptions).result;

			// check if content is valid
			if (content == '' || content == null)
				content = 'NO PREVIEW';

			return content;
		},

		convert: function(content, options) {
			// this method converts content with given options
			//  it is used to convert the input content and do show
			//  examples behind the format titles in the selection

			// compose conversion object
			//  this object contains all information of the current
			//  conversion including options and the content
			var conversion = {
				content: content,
				options: options,
				result: null,
				splittedContent: [],
				isSplittedContentConversion: true,
				splittedContentSeparator: null,
				isTextBasedOutput: true
			};
			// if a seperator is defined in the interpret part of the format
			//  this creates a splitted content array by this seperator
			// this will be used to convert block by block
			if (options.interpret.separator != undefined) {
				// a separator is given, splitted content conversion supported
				var splittedContent = content.split(options.interpret.separator);
				// fill array with content parts
				for (var i = 0; i < splittedContent.length; i ++)
					conversion.splittedContent.push({
						content: splittedContent[i],
						decimal: null,
						result: null
					});
			} else
				// here splitted content conversion is not supported
				// this could possibly be turned on if the format
				//  creates its splitted content table itself
				conversion.isSplittedContentConversion = false;

			// set splitted result separator
			if (options.convert != null)
				conversion.splittedContentSeparator =
					options.convert.separator != undefined
						? options.convert.separator : '';
			else
				conversion.splittedContentSeparator = false;

			// following methods interpret, convert and store results
			//  in the conversion object created before

			// interpret
			cryptii.conversion.formats[options.interpret.format].interpret.run(
				conversion, options.interpret);

			// convert
			if (options.convert != null)
			{
				cryptii.conversion.formats[options.convert.format].convert.run(
				conversion, options.convert);
			}

			// sum splitted result
			//  to display it immediately
			if (conversion.isTextBasedOutput
				&& conversion.isSplittedContentConversion) {

				conversion.result = '';
				for (var i = 0; i < conversion.splittedContent.length; i ++) {
					var entryResult = conversion.splittedContent[i].result;
					if (entryResult != null)
						conversion.result += (conversion.result != ''
							? conversion.splittedContentSeparator : '')
							+ entryResult;
				}
			}

			return conversion;
		}
	};

})($, cryptii);
