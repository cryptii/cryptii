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

		init: function()
		{
			if (cryptii.conversion.interpretFormat == null)
				cryptii.conversion.setInterpretFormat(
					cryptii.options.defaultInterpretFormat);

			if (cryptii.conversion.convertFormat == null)
				cryptii.conversion.setConvertFormat(
					cryptii.options.defaultConvertFormat);
		},

		registerFormat: function(name, formatDef)
		{
			cryptii.conversion.formats[name] = formatDef;
		},

		//
		// EVENTS
		//
		inputContentHasChangedEvent: function()
		{
			if (cryptii.view.viewMode == 2)
				// convert format selection visible
				// update preview
				cryptii.view.updateSelections();

			// launch conversion
			cryptii.conversion.launch();
		},
		formatHasChangedEvent: function()
		{
			cryptii.conversion.launch();
		},
		optionsHasChangedEvent: function()
		{
			// treat this as a content has changed event
			cryptii.conversion.inputContentHasChangedEvent();
		},

		//
		// METHODS
		//
		setInterpretFormat: function(format)
		{
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

			if (cryptii.isInitialized)
			{
				// update url
				cryptii.view.updateUrl();
				// fire input content has changed event
				cryptii.conversion.formatHasChangedEvent();
				// activate has format changed flag
				cryptii.view.hasFormatChanged = true;
				// update view
				cryptii.view.updateView();
			}
		},

		getInterpretOptions: function()
		{
			var format = cryptii.conversion.interpretFormat;
			var options = cryptii.conversion.formats[format].interpret.options;

			$.each(options, function(name, option) {
				option.value = cryptii.conversion.interpretOptions[name];
			});

			return options;
		},

		getInterpretOption: function(name)
		{
			var options = cryptii.conversion.getInterpretOptions();
			return options[name];
		},

		setInterpretOption: function(name, value)
		{
			// store option value
			cryptii.conversion.interpretOptions[name] = value;
			// event
			cryptii.conversion.optionsHasChangedEvent();
		},

		setConvertFormat: function(format)
		{
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

			if (cryptii.isInitialized)
			{
				// update url
				cryptii.view.updateUrl();
				// fire input content has changed event
				cryptii.conversion.formatHasChangedEvent();
				// activate has format changed flag
				cryptii.view.hasFormatChanged = true;
				// update view
				cryptii.view.updateView();
			}
		},

		getConvertOptions: function()
		{
			var format = cryptii.conversion.convertFormat;
			var options = cryptii.conversion.formats[format].convert.options;

			$.each(options, function(name, option) {
				option.value = cryptii.conversion.convertOptions[name];
			});

			return options;
		},

		getConvertOption: function(name)
		{
			var options = cryptii.conversion.getConvertOptions();
			return options[name];
		},

		setConvertOption: function(name, value)
		{
			// store option value
			cryptii.conversion.convertOptions[name] = value;
			// event
			cryptii.conversion.optionsHasChangedEvent();
		},

		launch: function()
		{
			// this method launches the actual conversion
			//  from input content to output

			// don't launch conversion if not already initiated
			if (!cryptii.isInitialized)
				return;

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

		convertPreviewContent: function(format, useCurrentInputContent)
		{
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
			if (useCurrentInputContent)
				// use interpret options
				$.each(cryptii.conversion.getInterpretOptions(), function(name, option) {
					conversionOptions.interpret[name] = option.value;
				});
			else
				// use defaults
				$.each(cryptii.conversion.formats[interpretFormat].interpret.options, function(name, option) {
					conversionOptions.interpret[name] = option.default;
				});

			// use convert option defaults
			$.each(cryptii.conversion.formats[convertFormat].convert.options, function(name, option) {
				conversionOptions.convert[name] = option.default;
			});

			// create sample content
			var conversion = cryptii.conversion.convert(inputContent, conversionOptions);

			// use html result if compatible
			var content = conversion.result;
			if (conversion.canHtmlResultBeDisplayedInSelection)
				content = conversion.resultHtml;

			// check if content is valid
			if (content == '' || content == null)
				content = 'NO PREVIEW';

			return content;
		},

		convert: function(content, options)
		{
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
				resultHtml: null,
				splittedContent: [],
				isSplittedContentConversion: true,
				splittedContentSeparator: null,
				splittedContentHtmlSeparator: null,
				isResultHtmlAvailable: false,
				canHtmlResultBeDisplayedInSelection: false
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
						result: null,
						resultHtml: null
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

			// by default, the html separator is the same as the plain text separator
			conversion.splittedContentHtmlSeparator = conversion.splittedContentSeparator;

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

				// sum splitted result
				//  to display it immediately
				if (conversion.isSplittedContentConversion) {

					conversion.result = '';
					conversion.resultHtml = [];

					var htmlOutputAvailable = false;

					for (var i = 0; i < conversion.splittedContent.length; i ++)
					{
						var entry = conversion.splittedContent[i];

						// treat text based result
						if (entry.result != null)
							conversion.result += (conversion.result != ''
								? conversion.splittedContentSeparator : '')
								+ entry.result;

						// treat html based result
						if (conversion.isResultHtmlAvailable)
						{
							if (conversion.resultHtml.length > 0
								&& (entry.resultHtml != null || entry.result != null)
								&& conversion.splittedContentHtmlSeparator != null)
								// add separator
								conversion.resultHtml.push(
									conversion.splittedContentHtmlSeparator);

							if (entry.resultHtml != null)
							{
								// html entry available
								htmlOutputAvailable = true;

								// is it all html elements of this single entry
								$.each(entry.resultHtml, function(index, singleResultHtml) {
									conversion.resultHtml.push(singleResultHtml);
								});
							}
							else if (entry.result != null)
							{
								// add plaintext char to list
								conversion.resultHtml.push(entry.result);
							}
						}
					}

					// clear result html, if not available
					if (!conversion.isResultHtmlAvailable)
						conversion.resultHtml = null;
				}
			
			}

			return conversion;
		}
	};

})($, cryptii);
