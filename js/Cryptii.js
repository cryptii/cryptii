//
// Cryptii
// Main Application Script
//

// global variable
var cryptii = cryptii || {};
var _gaq = _gaq || [];

(function($, window, document, cryptii, _gaq) {

	"use strict";

	//
	// OPTIONS
	//
	cryptii.options = {
		// view
		minimumContentHeight: 200,
		defaultInputContent:
			'The quick brown fox jumps over 13 lazy dogs.',
		// conversion
		defaultInterpretFormat: 'text',
		defaultConvertFormat: 'decimal'
	};

	// initialized flag
	cryptii.isInitialized = false;

	//
	// VIEW
	//
	cryptii.view = {

		// attributes
		$contentHeightMeasurement: null,

		$container: null,

		$inputTextarea: null,
		$inputField: null,
		$inputFieldContainer: null,
		$interpretOptions: null,
		$interpretSelection: null,
		$interpretToolbox: null,

		$outputField: null,
		$outputFieldContainer: null,
		$convertOptions: null,
		$convertSelection: null,
		$convertToolbox: null,

		$interpretFormatSpan: null,
		$convertFormatSpan: null,

		// array of option elements
		$interpretOptionFields: null,
		$convertOptionFields: null,

		lastInputContent: null,
		hasInputContentChanged: false,
		hasFormatChanged: false,

		// view modes
		// 0 - input and output field visible
		// 1 - interpret selection and output field visible
		// 2 - input field and convert selection visible
		//
		viewMode: -1,
		
		init: function() {

			// allow click outside application frame to close
			$('html').click(function() {
				// reset view mode
				if (cryptii.view.viewMode != 0)
					cryptii.view.setViewMode(0, true);
			});

			// hide more description
			$('#more').hide();

			// create environment
			cryptii.view.$container = $('#application')
				.click(function(event){
				    event.stopPropagation();
				});

			// pipe
			cryptii.view.$interpretFormatSpan = $(document.createElement('span'))
				.addClass('value');
			cryptii.view.$convertFormatSpan = $(document.createElement('span'))
				.addClass('value');

			var $pipe = $(document.createElement('div'))
				.attr('id', 'pipe')
				.append(
					$(document.createElement('div'))
						.attr('id', 'step_interpret')
						.addClass('step')
						.append(
							$(document.createElement('span'))
								.text('Interpret as')
								.addClass('label'),
							cryptii.view.$interpretFormatSpan
						)
						.click(function(event) {
							cryptii.view.setViewMode(
								cryptii.view.viewMode == 1 ? 0 : 1, true);
						}),
					$(document.createElement('div'))
						.attr('id', 'step_convert')
						.addClass('step')
						.append(
							$(document.createElement('span'))
								.text('Convert to')
								.addClass('label'),
							cryptii.view.$convertFormatSpan
						)
						.click(function(event) {
							cryptii.view.setViewMode(
								cryptii.view.viewMode == 2 ? 0 : 2, true);
						})
				);

			// input
			cryptii.view.$inputTextarea = $(document.createElement('textarea'))
				.attr('spellcheck', 'false')
				.attr('id', 'inputTextarea')
				.text(cryptii.options.defaultInputContent)
				.keypress(function() { cryptii.view.updateContentHeight(); })
				.change(function() { cryptii.view.updateContentHeight(); });

			cryptii.view.$inputField = $(document.createElement('div'))
				.attr('id', 'inputField');

			cryptii.view.$interpretOptions = $(document.createElement('div'))
				.attr('id', 'interpretOptions');

			cryptii.view.$interpretSelection = $(document.createElement('div'))
				.attr('id', 'interpretSelection');

			cryptii.view.$interpretToolbox = $(document.createElement('div'))
				.attr('id', 'interpretToolbox');

			cryptii.view.$inputFieldContainer = $(document.createElement('div'))
				.attr('id', 'inputFieldContainer')
				.append(
					cryptii.view.$inputTextarea,
					cryptii.view.$inputField,
					cryptii.view.$interpretToolbox);

			var $input = $(document.createElement('div'))
				.attr('id', 'input')
				.append(
					cryptii.view.$interpretOptions,
					cryptii.view.$inputFieldContainer,
					cryptii.view.$interpretSelection);

			// output
			cryptii.view.$outputField = $(document.createElement('div'))
				.attr('id', 'outputField');

			cryptii.view.$convertOptions = $(document.createElement('div'))
				.attr('id', 'convertOptions');

			cryptii.view.$convertSelection = $(document.createElement('div'))
				.attr('id', 'convertSelection');

			cryptii.view.$convertToolbox = $(document.createElement('div'))
				.attr('id', 'convertToolbox');

			cryptii.view.$outputFieldContainer = $(document.createElement('div'))
				.attr('id', 'outputFieldContainer')
				.append(
					cryptii.view.$outputField,
					cryptii.view.$convertToolbox);

			var $output = $(document.createElement('div'))
				.attr('id', 'output')
				.append(
					cryptii.view.$convertOptions,
					cryptii.view.$outputFieldContainer,
					cryptii.view.$convertSelection);

			// content height measurement
			cryptii.view.$contentHeightMeasurement = $(document.createElement('div'))
				.attr('id', 'contentHeightMeasurement');

			// clear
			var $clear = $(document.createElement('div'))
				.css({ clear: 'both' });

			// append it to body
			cryptii.view.$container.append(
				cryptii.view.$contentHeightMeasurement,
				$pipe,
				$output,
				$input,
				$clear);

			// apply view mode
			cryptii.view.setViewMode(0, false);

			// register hash changing event
			History.Adapter.bind(window, 'statechange', function() {
				cryptii.view.urlHasChangedEvent();
			});

			// register resize event
			$(window).resize(cryptii.view.windowSizeHasChanged);
			
			// initial event call
			cryptii.view.windowSizeHasChanged();
		},

		windowSizeHasChanged: function() {
			// update size of application
			cryptii.view.$container.css({
				minHeight: $(window).height() - 70
			});
		},

		setInputContent: function(content) {
			cryptii.view.$inputTextarea.val(content);
			cryptii.view.updateContentHeight();
		},

		getInputContent: function() {
			// returns current input
			return cryptii.view.$inputTextarea.val();
		},

		setOutputContent: function(result) {
			// show output content by result object
			//  see cryptii.conversion (result is a conversion object)

			// clear previous content
			cryptii.view.$inputField.html('');
			cryptii.view.$inputField.removeClass();
			cryptii.view.$outputField.html('');
			cryptii.view.$outputField.removeClass();
			// add format classes to fields
			cryptii.view.$inputField.addClass(result.options.interpret.format);
			cryptii.view.$outputField.addClass(result.options.convert.format);
			// is this content text based
			if (result.isTextBasedOutput) {
				// is splitted content converted
				if (result.isSplittedContentConversion) {
					// add each splitted content entry
					for (var i = 0; i < result.splittedContent.length; i ++) {
						var entry = result.splittedContent[i];
						// only add splitted entries when result exists
						if (entry.result != null) {
							var $result = $(document.createElement('span'))
								.text(entry.result);
							// append it
							cryptii.view.$outputField.append(
								i > 0 ? result.splittedContentSeparator : null,
								$result);
						}
					}
				} else {
					// just insert output
					cryptii.view.$outputField.text(result.result);
				}

			} else {
				// this output is not text based
				// output depends on convert format
				var convertFormat = result.options.convert.format;
				if (convertFormat == 'pigpen') {
					// add each splitted content entry
					for (var i = 0; i < result.splittedContent.length; i ++) {
						var entry = result.splittedContent[i];
						if (entry.result.length == 2
							&& entry.result[0] == 'p') {
							// this is a pigpen symbol
							var symbol = entry.result[1].toLowerCase();
							var decimal = entry.decimal;
							if (decimal <= 90)
								decimal += 32;
							var backgroundPositionLeft = - (decimal - 97) * 10;
							cryptii.view.$outputField.append(
								$(document.createElement('span'))
									.addClass('pigpen')
									.css({
										backgroundPosition: backgroundPositionLeft + 'px 0'
									})
									.text(symbol));
						} else {
							// add non-pigpen symbol
							cryptii.view.$outputField.append(entry.result);
						}
					}
				}
			}
		},

		elementsForViewMode: function(viewMode) {
			// this method collects views which should
			//  be displayed in a specific view mode
			if (viewMode == -1)
				// all elements
				return [
					cryptii.view.$inputFieldContainer,
					cryptii.view.$interpretOptions,
					cryptii.view.$interpretSelection,
					cryptii.view.$outputFieldContainer,
					cryptii.view.$convertOptions,
					cryptii.view.$convertSelection];
			if (viewMode == 0)
				return [
					cryptii.view.$inputFieldContainer,
					cryptii.view.$interpretOptions,
					cryptii.view.$outputFieldContainer,
					cryptii.view.$convertOptions];
			else if (viewMode == 1)
				return [
					cryptii.view.$interpretSelection,
					cryptii.view.$outputFieldContainer,
					cryptii.view.$convertOptions];
			else if (viewMode == 2)
				return [
					cryptii.view.$inputFieldContainer,
					cryptii.view.$convertSelection,
					cryptii.view.$interpretOptions];
		},

		setViewMode: function(viewMode, animated) {
			// store last view mode
			var lastViewMode = cryptii.view.viewMode;
			// update actual view mode
			cryptii.view.viewMode = viewMode;
			var visibleElements = cryptii.view.elementsForViewMode(lastViewMode);
			var showElements = cryptii.view.elementsForViewMode(viewMode);
			// update selections if needed
			if (cryptii.isInitialized && viewMode != 0)
				cryptii.view.updateSelections();
			// hide elements
			for (var i = 0; i < visibleElements.length; i ++) {
				var element = visibleElements[i];
				if (showElements.indexOf(element) == -1) {
					// hide element without animating
					element.hide();
				}
			}
			// show elements
			for (var i = 0; i < showElements.length; i ++) {
				var element = showElements[i];
				if (visibleElements.indexOf(element) == -1) {
					// show element
					element.show();
				}
			}
		},

		updateContentHeight: function() {
			// this method mesures the hight needed by the input content

			// replace special tags
			var content = cryptii.view.getInputContent()
				.replace(/\\n/g, '<br />');
			cryptii.view.$contentHeightMeasurement.text(content);
			// apply minimum content height
			var height = Math.max(
				cryptii.view.$contentHeightMeasurement.height() + 30,
				cryptii.options.minimumContentHeight);
			// update height
			cryptii.view.$inputTextarea.height(height - 4);
		},

		updateSelections: function() {
			// this method updates the interpret and convert
			//  selection including the examples behind
			//  the format labels
			// interpret selections only gets updated when initializing

			// clear selections
			if (!cryptii.isInitialized)
				cryptii.view.$interpretSelection.html('');

			cryptii.view.$convertSelection.html('');
			// category cache
			var lastInterpretCategory = null;
			var lastConvertCategory = null;
			// go through formats
			for (var format in cryptii.conversion.formats) {
				var formatDef = cryptii.conversion.formats[format];
				// collect data to display
				var title = formatDef.title;

				if (!cryptii.isInitialized) {

					if (formatDef.interpret != undefined) {
						var example = cryptii.conversion.convert(
							// use a shorted version of input content
							cryptii.options.defaultInputContent, {
								interpret: $.extend({
									format: 'text'
								}, cryptii.conversion.formats['text'].interpret.options),
								convert: $.extend(true, {
									format: format
								}, formatDef.convert.options)
							}).result;
						// check if example is valid
						if (example == '' || example == null)
							example = 'NO PREVIEW';
						// add format to convert selection
						var $format = $(document.createElement('div'))
							.addClass('format')
							.append(
								$(document.createElement('span'))
									.addClass('title')
									.text(title),
								$(document.createElement('span'))
									.addClass('example')
									.text(example)
							);
						// click event
						$format.click($.proxy(function(event) {
							// change format
							cryptii.conversion.setInterpretFormat(this.format);
							// reset view mode
							cryptii.view.setViewMode(0, true);
						}, { format: format }));
						// append category if available
						if (lastInterpretCategory != null) {
							cryptii.view.$interpretSelection.append($.extend({}, lastInterpretCategory));
							lastInterpretCategory = null;
						}
						// view it
						cryptii.view.$interpretSelection.append($format);
					}
				}

				if (formatDef.convert != undefined) {
					var example = cryptii.conversion.convert(
					// use a shorted version of input content
					cryptii.view.getInputContent(), {
						interpret: $.extend({
							format: cryptii.conversion.interpretFormat
						}, cryptii.conversion.interpretOptions),
						convert: $.extend(true, {
							format: format
						}, formatDef.convert.options)
					}).result;
					// check if example is valid
					if (example == '' || example == null)
						example = 'NO PREVIEW';
					// add format to convert selection
					var $format = $(document.createElement('div'))
						.addClass('format')
						.append(
							$(document.createElement('span'))
								.addClass('title')
								.text(title),
							$(document.createElement('span'))
								.addClass('example')
								.text(example)
						);
					// click event
					$format.click($.proxy(function(event) {
						// change format
						cryptii.conversion.setConvertFormat(this.format);
						// reset view mode
						cryptii.view.setViewMode(0, true);
					}, { format: format }));
					// append category if available
					if (lastConvertCategory != null) {
						cryptii.view.$convertSelection.append($.extend({}, lastConvertCategory));
						lastConvertCategory = null;
					}
					// view it
					cryptii.view.$convertSelection.append($format);
				}

				if (formatDef.interpret == undefined
					&& formatDef.convert == undefined) {
					// no convert or interpret method available
					//  this is a category
					lastInterpretCategory = $(document.createElement('div'))
						.addClass('category')
						.text(title);
					lastConvertCategory = lastInterpretCategory.clone();
				}
			}
		},

		updateOptions: function() {
			// clear options
			cryptii.view.$interpretOptions.html('');
			cryptii.view.$interpretOptionFields = [];
			cryptii.view.$convertOptions.html('');
			cryptii.view.$convertOptionFields = [];
			// convert options
			var interpretOptions = cryptii.conversion.interpretOptions;
			if (Object.keys(interpretOptions).length > 0) {
				for (var key in interpretOptions) {
					var option = cryptii.view.createOption(
						key, interpretOptions[key]);
					cryptii.view.$interpretOptions.append(option.$option);
					// store field to track updates
					cryptii.view.$interpretOptionFields[key] = option.$field;
				}
			}
			// interpret options
			var convertOptions = cryptii.conversion.convertOptions;
			if (Object.keys(convertOptions).length > 0) {
				for (var key in convertOptions) {
					var option = cryptii.view.createOption(
						key, convertOptions[key]);
					cryptii.view.$convertOptions.append(option.$option);
					// store field to track updates
					cryptii.view.$convertOptionFields[key] = option.$field;
				}
			}
		},

		createOption: function(option, value) {
			var optionDef = cryptii.conversion.options[option];
			var field = null;
			if (optionDef.type == 'text')
				field = $(document.createElement('input'))
					.attr('type', 'text')
					.addClass('text')
					.val(value);
			else if (optionDef.type == 'boolean')
				field = $(document.createElement('input'))
					.attr('type', 'checkbox')
					.prop('checked', value)
					.addClass('checkbox');
			else if (optionDef.type == 'slider')
				field = $(document.createElement('div'))
					.slider({
						range: 'max',
						min: optionDef.minimum,
						max: optionDef.maximum,
						value: value
					})
					.addClass('slider');
			return {
				$option: $(document.createElement('div'))
					.addClass('option')
					.append(
						$(document.createElement('label'))
							.text(optionDef.title),
						field),
				$field: field
			};
		},

		getOptionValue: function(isConvertOption, key) {
			// if isConvertOption, use convert options,
			//  if not use interpret options
			// collect information
			var optionDef = cryptii.conversion.options[key];
			var optionField = isConvertOption ? cryptii.view.$convertOptionFields[key] : cryptii.view.$interpretOptionFields[key];
			// read value of this option field
			var value = null;
			if (optionDef.type == 'text')
				value = optionField.val();
			else if (optionDef.type == 'boolean')
				value = optionField.prop('checked');
			else if (optionDef.type == 'slider') {
				value = optionField.slider('option', 'value');
			}
			return value;
		},

		updateToolbox: function() {
			// get format definitions
			var interpretFormatDef = cryptii.conversion.formats[cryptii.conversion.interpretFormat];
			var convertFormatDef = cryptii.conversion.formats[cryptii.conversion.convertFormat];

			// clear toolboxes
			cryptii.view.$interpretToolbox.html('');
			cryptii.view.$convertToolbox.html('');

			// interpret toolbox
			if (interpretFormatDef.url != null) {
				cryptii.view.$interpretToolbox.append(
					$(document.createElement('a'))
						.addClass('help')
						.attr('href', interpretFormatDef.url)
						.attr('target', '_blank')
						.text(interpretFormatDef.title));
			}

			// convert toolbox
			if (convertFormatDef.url != null) {
				cryptii.view.$convertToolbox.append(
					$(document.createElement('a'))
						.addClass('help')
						.attr('href', convertFormatDef.url)
						.attr('target', '_blank')
						.text(convertFormatDef.title));
			}
		},

		updateUrl: function() {
			var state = cryptii.conversion.getHistoryState();
			// read hash
			var urlParts = History.getState().hash.split('?');
			var currentUrl = urlParts[0];
			// is this a new state
			if (state != null && currentUrl != state.url) {
				// push state
				History.pushState({},
					state.title,
					state.url);
				// track pageview
				_gaq.push(['_trackPageview']);
			}
		},

		urlHasChangedEvent: function() {
			var state = History.getState();
			// read hash
			var hashParts = state.hash.split('?');
			hashParts = hashParts[0].split('/');
			// check if format exists and apply
			var interpretFormat = hashParts[1];
			if (cryptii.conversion.formats[interpretFormat] != undefined
				&& cryptii.conversion.formats[interpretFormat].interpret != undefined)
				cryptii.conversion.setInterpretFormat(interpretFormat);
			var convertFormat = hashParts[2];
			if (cryptii.conversion.formats[convertFormat] != undefined
				&& cryptii.conversion.formats[convertFormat].convert != undefined)
				cryptii.conversion.setConvertFormat(convertFormat);
		},

		updateView: function() {
			if (cryptii.view.hasInputContentChanged)
				// update heights
				cryptii.view.updateContentHeight();

			if (cryptii.view.hasFormatChanged) {
				// update format titles
				cryptii.view.$interpretFormatSpan.text(
					cryptii.conversion.formats[cryptii.conversion.interpretFormat].title);
				cryptii.view.$convertFormatSpan.text(
					cryptii.conversion.formats[cryptii.conversion.convertFormat].title);
				// update toolbox
				cryptii.view.updateToolbox();
				// update options
				cryptii.view.updateOptions();
			}

			if (cryptii.view.hasInputContentChanged
				|| cryptii.view.hasFormatChanged) {

				if (cryptii.view.viewMode != 0)
					// update selections
					cryptii.view.updateSelections();

				// reset
				cryptii.view.hasInputContentChanged = false;
				cryptii.view.hasFormatChanged = false;
				// update last input content
				cryptii.view.lastInputContent = cryptii.view.getInputContent();
			}
		}

	};

	//
	// CONVERSION
	//
	cryptii.conversion = {

		// attributes
		interpretFormat: null,
		interpretOptions: null,

		convertFormat: null,
		convertOptions: null,

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
			// reset options to default (copy)
			cryptii.conversion.interpretOptions =
				$.extend(true, {}, cryptii.conversion.formats[format].interpret.options);
			
			// prepare input content for this interpret format
			var content = cryptii.options.defaultInputContent;
			if (format != 'text')
				content = cryptii.conversion.convert(
					cryptii.options.defaultInputContent, {
						interpret: $.extend({
							format: 'text'
						}, cryptii.conversion.formats['text'].interpret.options),
						convert: $.extend(true, {
							format: format
						}, cryptii.conversion.formats[format].convert.options)
					}).result;

			// update content
			cryptii.view.setInputContent(content);

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

		setConvertFormat: function(format) {
			if (cryptii.conversion.convertFormat == format)
				// nothing to do.
				return;
			// change actual format
			cryptii.conversion.convertFormat = format;
			// reset options to default (copy)
			cryptii.conversion.convertOptions =
				$.extend(true, {}, cryptii.conversion.formats[format].convert.options);
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
			conversion.splittedContentSeparator =
				options.convert.separator != undefined
					? options.convert.separator : '';

			// following methods interpret, convert and store results
			//  in the conversion object created before

			// interpret
			cryptii.conversion.formats[options.interpret.format].interpret.run(
				conversion, options.interpret);
			// convert
			cryptii.conversion.formats[options.convert.format].convert.run(
				conversion, options.convert);

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
		},

		//
		// OPTION DEFINITION
		//
		options: {
			separator: { title: 'Separator', type: 'text' },
			fillUpBytes: { title: 'Fill up bytes', type: 'boolean' },
			morsecodeLongChar: { title: 'Long', type: 'text' },
			morsecodeShortChar: { title: 'Short', type: 'text' },
			morsecodeSpaceChar: { title: 'Space', type: 'text' },
			shift: { title: 'Shift', type: 'text' },
			density: { title: 'Density', type: 'slider', minimum: 0, maximum: 100 }
		},

		//
		// FORMAT DEFINITION
		//
		// All formats are described below. In addition, it contains the
		//  interpret and convert options and methods to run the actual
		//  conversion between formats.
		//
		formats: {

			//
			// CATEGORY ALPHABET
			//
			'catalphabet': {
				title: 'Alphabet'
			},

			//
			// TEXT
			//
			'text': {
				title: 'Text',
				url: 'http://en.wikipedia.org/wiki/ASCII',
				interpret: {
					options: {
					},
					run: function(conversion, options) {
						conversion.isSplittedContentConversion = true;
						for (var i = 0; i < conversion.content.length; i ++) {
							var content = conversion.content[i];
							conversion.splittedContent.push({
								content: content,
								decimal: cryptii.conversion.ord(content),
								result: null
							});
						}
					}
				},
				convert: {
					options: {
					},
					run: function(conversion, options) {
						for (var i = 0; i < conversion.splittedContent.length; i ++) {
							var entry = conversion.splittedContent[i];
							if (entry.decimal != null)
								entry.result = cryptii.conversion.chr(entry.decimal);
						}
					}
				}
			},

			//
			// FLIPPED
			//
			'flipped': {
				title: 'Flipped',
				url: null,
				convert: {
					options: {
					},
					run: function(conversion, options) {
						// turn off splitted conversion
						conversion.isSplittedContentConversion = false;
						// flip whole content
						var result = '';
						for (var i = 0; i < conversion.content.length; i ++)
							result = conversion.content[i] + result;
						conversion.result = result;
					}
				}
			},

			//
			// HTML Entities
			//
			'htmlentities': {
				title: 'HTML Entities',
				url: 'http://en.wikipedia.org/wiki/HTML_Entities',
				interpret: {
					options: {
					},
					run: function(conversion, options) {
						conversion.isSplittedContentConversion = true;
						// go through the provided content and search for entities
						var content = conversion.content;
						var i = 0;
						while (i < content.length) {
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
									decimal: cryptii.conversion.ord(content[i]),
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
					run: function(conversion, options) {
						for (var i = 0; i < conversion.splittedContent.length; i ++) {
							var entry = conversion.splittedContent[i];
							if (entry.decimal != null)
								// compose html entity
								entry.result = '&#' + entry.decimal + ';';
						}
					}
				}
			},

			//
			// MORSECODE
			//
			'morsecode': {
				title: 'Morsecode',
				url: 'http://en.wikipedia.org/wiki/Morsecode',
				alphabet: {
					"a":"SL", "b":"LSSS", "c":"LSLS", "d":"LSS", "e":"S", "f":"SSLS", "g":"LLS", "h":"SSSS", "i":"SS", "j":"SLLL", "k":"LSL", "l":"SLSS", "m":"LL",
					"n":"LS", "o":"LLL", "p":"SLLS", "q":"LLSL", "r":"SLS", "s":"SSS", "t":"L", "u":"SSL", "v":"SSSL", "w":"SLL", "x":"LSSL", "y":"LSLL", "z":"LLSS",
					"0":"LLLLL", "1":"SLLLL", "2":"SSLLL", "3":"SSSLL", "4":"SSSSL", "5":"SSSSS", "6":"LSSSS", "7":"LLSSS",
					"8":"LLLSS", "9":"LLLLS", "à":"SLLSL", "ä":"SLSL",  "è":"SLSSL", "é":"SSLSS", "ö":"LLLS",  "ü":"SSLL",  "ß":"SSSLLSS",
					"S":"SLSLSL", ",":"LLSSLL", ":":"LLLSSS", ";":"LSLSLS", "?":"SSLLSS", "&":"SLSSS", "\$":"SSSLSSL", "L":"LSSSSL", "_":"SSLLSL", "(":"LSLLS",
					")":"LSLLSL", "'":"SLLLLS", "\"":"SLSSLS", "=":"LSSSL", "+":"SLSLS", "/":"LSSLS", "@":"SLLSLS", " ":"E"
				},
				interpret: {
					options: {
						separator: ' ',
						morsecodeLongChar: '-',
						morsecodeShortChar: '.',
						morsecodeSpaceChar: '/'
					},
					run: function(conversion, options) {
						var alphabet = cryptii.conversion.formats['morsecode'].alphabet;
						var flippedAlphabet = {};
						// flip morse code alphabet
						for (var key in alphabet)
							flippedAlphabet[alphabet[key]] = key;
						// translate
						for (var i = 0; i < conversion.splittedContent.length; i ++) {
							var entry = conversion.splittedContent[i];
							var key = entry.content.toLowerCase();
							key = cryptii.conversion.replaceAll(key, options.morsecodeLongChar, 'L');
							key = cryptii.conversion.replaceAll(key, options.morsecodeShortChar, 'S');
							key = cryptii.conversion.replaceAll(key, options.morsecodeSpaceChar, 'E');
							if (flippedAlphabet[key] != undefined) {
								entry.decimal = cryptii.conversion.ord(flippedAlphabet[key].toLowerCase());
							}
						}
					}	
				},
				convert: {
					options: {
						separator: ' ',
						morsecodeLongChar: '-',
						morsecodeShortChar: '.',
						morsecodeSpaceChar: '/'
					},
					run: function(conversion, options) {
						var alphabet = cryptii.conversion.formats['morsecode'].alphabet;
						// translate
						for (var i = 0; i < conversion.splittedContent.length; i ++) {
							var entry = conversion.splittedContent[i];
							if (entry.decimal != null) {
								var key = cryptii.conversion.chr(entry.decimal).toLowerCase();
								if (alphabet[key] != undefined) {
									var result = alphabet[key];
									result = cryptii.conversion.replaceAll(result, 'L', options.morsecodeLongChar);
									result = cryptii.conversion.replaceAll(result, 'S', options.morsecodeShortChar);
									result = cryptii.conversion.replaceAll(result, 'E', options.morsecodeSpaceChar);
									entry.result = result;
								}
							}
						}
					}
				}
			},

			//
			// LEETSPEAK
			//
			'leetspeak': {
				title: 'Leetspeak',
				url: 'http://en.wikipedia.org/wiki/Leet',
				alphabet: {
					'a': ['4', '/-\\', '/\\', '@'],
					'b': ['|3', '8', '|o'],
					'c': ['(', '<', 'K'],
					'd': ['|)', 'o|', '|>', '<|', 'Ð'],
					'e': '3',
					'f': ['|=', 'ph', 'ƒ'],
					'g': ['(', '9', '6'],
					'h': ['|-|', '#'],
					'i': ['l', '1', '|', '!'],
					'j': ['_|'],
					'k': ['|<', '|{'],
					'l': ['|_', '|', '1'],
					'm': ['|\\/|', '/\\/\\', '|\'|\'|', '/v\\'],
					'n': ['|\\|', '/\\/', '/|/'],
					'o': ['0', '()', '[]'],
					'p': ['|2', '|D'],
					'q': ['(,)', 'kw'],
					'r': ['|2', '|Z', '|?'],
					's': ['5', '$'],
					't': ['+', '\'][\'', '7'],
					'u': ['|_|'],
					'v': ['|/', '\\|', '\\/'],
					'w': ['\\/\\/', '\\|\\|', '|/|/', '\\|/'],
					'x': ['><', '}{'],
					'y': ['`/', '\'/', 'j'],
					'z': ['2', '(\\)']
				},
				convert: {
					options: {
						density: '50'
					},
					run: function(conversion, options) {
						var alphabet = cryptii.conversion.formats['leetspeak'].alphabet;
						var density = options.density / 100.0;
						// translate
						for (var i = 0; i < conversion.splittedContent.length; i ++) {
							var entry = conversion.splittedContent[i];
							if (entry.decimal != null) {
								var letter = cryptii.conversion.chr(entry.decimal);
								var useLeet = (density > Math.random());
								if (useLeet && alphabet[letter.toLowerCase()] != undefined) {

									var chars = alphabet[letter.toLowerCase()];
									if (typeof chars === 'string')
										// pick this char
										entry.result = chars;
									else
										// pick random one
										entry.result = chars[parseInt(Math.random() * chars.length)];

								} else
									entry.result = letter;
							}
						}
					}
				}
			},

			//
			// CATEGORY NUMERIC
			//
			'catnumeric': {
				title: 'Numeric'
			},

			//
			// DECIMAL
			//
			'decimal': {
				title: 'Decimal',
				url: 'http://en.wikipedia.org/wiki/ASCII',
				interpret: {
					options: {
						separator: ' '
					},
					run: function(conversion, options) {
						for (var i = 0; i < conversion.splittedContent.length; i ++) {
							var entry = conversion.splittedContent[i];
							var decimal = parseInt(entry.content);
							if (!isNaN(decimal))
								entry.decimal = decimal;
						}
					}
				},
				convert: {
					options: {
						separator: ' '
					},
					run: function(conversion, options) {
						for (var i = 0; i < conversion.splittedContent.length; i ++) {
							var entry = conversion.splittedContent[i];
							if (entry.decimal != null)
								entry.result = entry.decimal;
						}
					}
				}
			},

			//
			// BINARY
			//
			'binary': {
				title: 'Binary',
				url: 'http://en.wikipedia.org/wiki/ASCII',
				interpret: {
					options: {
						separator: ' '
					},
					run: function(conversion, options) {
						for (var i = 0; i < conversion.splittedContent.length; i ++) {
							var entry = conversion.splittedContent[i];
							var decimal = parseInt(entry.content, 2);
							if (!isNaN(decimal))
								entry.decimal = decimal;
						}
					}
				},
				convert: {
					options: {
						separator: ' ',
						fillUpBytes: true
					},
					run: function(conversion, options) {
						for (var i = 0; i < conversion.splittedContent.length; i ++) {
							var entry = conversion.splittedContent[i];
							var decimal = entry.decimal;
							if (decimal < 0)
								decimal = 0xFFFFFFFF + decimal + 1;
							// convert decimal to binary
							var binary = parseInt(decimal, 10).toString(2);
							if (!isNaN(binary)) {
								// fill up bytes if requested
								if (options.fillUpBytes)
									while (binary.length < 8)
										binary = '0' + binary;
								// store
								entry.result = binary;
							}
						}
					}
				}
			},

			//
			// OCTAL
			//
			'octal': {
				title: 'Octal',
				url: 'http://en.wikipedia.org/wiki/ASCII',
				interpret: {
					options: {
						separator: ' '
					},
					run: function(conversion, options) {
						for (var i = 0; i < conversion.splittedContent.length; i ++) {
							var entry = conversion.splittedContent[i];
							var decimal = parseInt(entry.content, 8);
							if (!isNaN(decimal))
								entry.decimal = decimal;
						}
					}
				},
				convert: {
					options: {
						separator: ' '
					},
					run: function(conversion, options) {
						for (var i = 0; i < conversion.splittedContent.length; i ++) {
							var entry = conversion.splittedContent[i];
							if (entry.decimal != null)
								// convert decimal to octal
								entry.result = entry.decimal.toString(8);
						}
					}
				}
			},

			//
			// HEXADECIMAL
			//
			'hexadecimal': {
				title: 'Hexadecimal',
				url: 'http://en.wikipedia.org/wiki/ASCII',
				interpret: {
					options: {
						separator: ' '
					},
					run: function(conversion, options) {
						for (var i = 0; i < conversion.splittedContent.length; i ++) {
							var entry = conversion.splittedContent[i];
							var decimal = parseInt(entry.content, 16);
							if (!isNaN(decimal))
								entry.decimal = decimal;
						}
					}
				},
				convert: {
					options: {
						separator: ' ',
						fillUpBytes: true
					},
					run: function(conversion, options) {
						for (var i = 0; i < conversion.splittedContent.length; i ++) {
							var entry = conversion.splittedContent[i];
							if (entry.decimal != null) {
								// convert decimal to hexadecimal
								var hexadecimal = entry.decimal.toString(16);
								// fill up bytes if requested
								if (options.fillUpBytes)
									while (hexadecimal.length < 2)
										hexadecimal = '0' + hexadecimal;
								// store
								entry.result = hexadecimal;
							}
						}
					}
				}
			},

			//
			// CATEGORY CIPHER
			//
			'catcipher': {
				title: 'Cipher'
			},

			//
			// ATBASH ROMAN
			//
			'atbash': {
				title: 'Atbash Roman',
				url: 'http://en.wikipedia.org/wiki/Atbash',
				convertDecimal: function(decimal) {
					// convert single decimal block
					// ignore spaces
					if (decimal == 32 || decimal == 10) 
						return decimal;
					// to uppercase
					if (decimal > 90)
						decimal -= 32;
					//check if it is alphabetic
					if (!(decimal >= 65 && decimal <= 90))
						return -1;
					// calculate
					return (25 - (decimal - 65) + 65);
				},
				interpret: {
					options: {
					},
					run: function(conversion, options) {
						conversion.isSplittedContentConversion = true;
						for (var i = 0; i < conversion.content.length; i ++) {
							var content = conversion.content[i];
							var decimal = cryptii.conversion.formats['atbash'].convertDecimal(
								cryptii.conversion.ord(content));
							if (decimal == -1)
								decimal = cryptii.conversion.ord(content);
							conversion.splittedContent.push({
								content: content,
								decimal: decimal,
								result: null
							});
						}
					}
				},
				convert: {
					options: {
					},
					run: function(conversion, options) {
						for (var i = 0; i < conversion.splittedContent.length; i ++) {
							var entry = conversion.splittedContent[i];
							if (entry.decimal != null) {
								var decimal = cryptii.conversion.formats['atbash'].convertDecimal(
									entry.decimal);
								if (decimal != -1)
									entry.result = cryptii.conversion.chr(decimal);
								else entry.result = cryptii.conversion.chr(entry.decimal);
							}
						}
					}
				}
			},

			//
			// CAESAR CIPHER
			//
			'caesar': {
				title: 'Caesar Cipher',
				url: 'http://en.wikipedia.org/wiki/Caesar_cipher',
				convertDecimal: function(decimal, shift) {
					// convert single decimal block
					shift = shift % 26;
					// don't shift spaces
					if (decimal == 32 || decimal == 10)
						return decimal;
					if (decimal > 90)
						// to uppercase
						decimal -= 32;

					var resultDecimalValue = decimal - shift;

					if (resultDecimalValue < 65)
						resultDecimalValue += 26;
					if (resultDecimalValue > 90)
						resultDecimalValue -= 26;

					// check if it is alphabetic
					if (decimal >= 65 && decimal <= 90)
						return resultDecimalValue;

					return -1;
				},
				interpret: {
					options: {
						shift: 3
					},
					run: function(conversion, options) {
						var shift = parseInt(options.shift, 10);
						if (!isNaN(shift)) {
							conversion.isSplittedContentConversion = true;
							for (var i = 0; i < conversion.content.length; i ++) {
								var content = conversion.content[i];
								var decimal = cryptii.conversion.formats['caesar'].convertDecimal(
									cryptii.conversion.ord(content), -shift);
								if (decimal == -1)
									decimal = cryptii.conversion.ord(content);
								conversion.splittedContent.push({
									content: content,
									decimal: decimal,
									result: null
								});
							}
						}
					}
				},
				convert: {
					options: {
						shift: 3
					},
					run: function(conversion, options) {
						var shift = parseInt(options.shift, 10);
						if (!isNaN(shift)) {
							for (var i = 0; i < conversion.splittedContent.length; i ++) {
								var entry = conversion.splittedContent[i];
								if (entry.decimal != null) {
									var decimal = cryptii.conversion.formats['caesar'].convertDecimal(
										entry.decimal, shift);
									if (decimal != -1)
										entry.result = cryptii.conversion.chr(decimal);
									else entry.result = cryptii.conversion.chr(entry.decimal);
								}
							}
						}
					}
				}
			},

			//
			// ITA2
			//
			'ita2': {
				title: 'ITA2 / CCITT-2',
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
						separator: ' '
					},
					run: function(conversion, options) {
						var ita2Code = cryptii.conversion.formats['ita2'].codes;
						// shift
						var letterShift = true;
						// go through splitted content
						for (var i = 0; i < conversion.splittedContent.length; i ++) {
							var entry = conversion.splittedContent[i];

							var row = ita2Code[entry.content];
							if (row != undefined) {
								var ita2Entry = row[letterShift ? 0 : 1];
								if (ita2Entry == 'letters')
									letterShift = true;
								else if (ita2Entry == 'figures')
									letterShift = false;
								else {
									entry.decimal = cryptii.conversion.ord(ita2Entry);
								}
							}
						}
					}
				},
				convert: {
					options: {
						separator: ' '
					},
					run: function(conversion, options) {
						var ita2Code = cryptii.conversion.formats['ita2'].codes;
						var flippedIta2Code = {};
						for (var code in ita2Code) {
							flippedIta2Code[ita2Code[code][0]] = code + 'l';
							flippedIta2Code[ita2Code[code][1]] = code + 'f';
						}
						// shift
						var letterShift = true;
						// go through splitted content
						for (var i = 0; i < conversion.splittedContent.length; i ++) {
							var entry = conversion.splittedContent[i];

							if (entry.decimal != null) {
								var asciiChar = cryptii.conversion.chr(entry.decimal).toLowerCase();
								var ita2Entry = flippedIta2Code[asciiChar];

								var result = '';

								if (ita2Entry != undefined) {
									var code = ita2Entry.substr(0, 5);
									var isLetterShift = (ita2Entry.substr(5, 1) == 'l');
									if (isLetterShift != letterShift
										&& (asciiChar != ' ' && asciiChar != "\t" && asciiChar != "\n")) {
										result = flippedIta2Code[isLetterShift ? 'letters' : 'figures'].substr(0, 5)
											+ options.separator;
										letterShift = isLetterShift;
									}

									result += code;
									entry.result = result;
								}
							}
						}
					}
				}
			},

			//
			// PIGPEN CIPHER
			//
			'pigpen': {
				title: 'Pigpen cipher',
				url: 'http://en.wikipedia.org/wiki/Pigpen_cipher',
				convert: {
					options: {
					},
					run: function(conversion, options) {
						// this is not a text based output
						conversion.isTextBasedOutput = false;

						for (var i = 0; i < conversion.splittedContent.length; i ++) {
							var entry = conversion.splittedContent[i];
							if (entry.decimal == null)
								return null;
							// uppercase letters
							if (entry.decimal >= 97 && entry.decimal <= 122)
								entry.decimal -= 32;
							// check if a pigpen symbol exists for this decimal
							if (entry.decimal >= 65 && entry.decimal <= 90)
								entry.result = 'p' + cryptii.conversion.chr(entry.decimal);
							else entry.result = cryptii.conversion.chr(entry.decimal);
						}
					}
				}
			},

			//
			// ROT 5
			//
			'rot5': {
				title: 'ROT5',
				url: 'http://en.wikipedia.org/wiki/ROT13',
				convertDecimal: function(decimal) {
					// convert single decimal block
					if (decimal >= 48 && decimal <= 57) {
						decimal += 5;
						if (decimal > 57)
							decimal -= 10;
					}
					return decimal;
				},
				interpret: {
					options: {
					},
					run: function(conversion, options) {
						conversion.isSplittedContentConversion = true;
						for (var i = 0; i < conversion.content.length; i ++) {
							var content = conversion.content[i];
							var decimal = cryptii.conversion.formats['rot5'].convertDecimal(
								cryptii.conversion.ord(content));
							conversion.splittedContent.push({
								content: content,
								decimal: decimal,
								result: null
							});
						}
					}
				},
				convert: {
					options: {
					},
					run: function(conversion, options) {
						for (var i = 0; i < conversion.splittedContent.length; i ++) {
							var entry = conversion.splittedContent[i];
							if (entry.decimal != null) {
								var decimal = cryptii.conversion.formats['rot5'].convertDecimal(
									entry.decimal);
								entry.result = cryptii.conversion.chr(decimal);
							}
						}
					}
				}
			},

			//
			// ROT 13
			//
			'rot13': {
				title: 'ROT13',
				url: 'http://en.wikipedia.org/wiki/ROT13',
				convertDecimal: function(decimal) {
					// convert single decimal block
					if (decimal >= 97 && decimal <= 122) {
						decimal += 13;
						if (decimal > 122)
							decimal -= 26;
					} else if (decimal >= 65 && decimal <= 90) {
						decimal += 13;
						if (decimal > 90)
							decimal -= 26;
					}
					return decimal;
				},
				interpret: {
					options: {
					},
					run: function(conversion, options) {
						conversion.isSplittedContentConversion = true;
						for (var i = 0; i < conversion.content.length; i ++) {
							var content = conversion.content[i];
							var decimal = cryptii.conversion.formats['rot13'].convertDecimal(
								cryptii.conversion.ord(content));
							conversion.splittedContent.push({
								content: content,
								decimal: decimal,
								result: null
							});
						}
					}
				},
				convert: {
					options: {
					},
					run: function(conversion, options) {
						for (var i = 0; i < conversion.splittedContent.length; i ++) {
							var entry = conversion.splittedContent[i];
							if (entry.decimal != null) {
								var decimal = cryptii.conversion.formats['rot13'].convertDecimal(
									entry.decimal);
								entry.result = cryptii.conversion.chr(decimal);
							}
						}
					}
				}
			},

			//
			// ROT 18
			//
			'rot18': {
				title: 'ROT18',
				url: 'http://en.wikipedia.org/wiki/ROT13',
				convertDecimal: function(decimal) {
					// convert single decimal block
					if (decimal >= 65 && decimal <= 90) {
						decimal += 13;
						if (decimal > 90)
							decimal -= 26;
					} else if (decimal >= 97 && decimal <= 122) {
						decimal += 13;
						if (decimal > 122)
							decimal -= 26;
					} else if (decimal >= 48 && decimal <= 57) {
						decimal += 5;
						if (decimal > 57)
							decimal -= 10;
					}
					return decimal;
				},
				interpret: {
					options: {
					},
					run: function(conversion, options) {
						conversion.isSplittedContentConversion = true;
						for (var i = 0; i < conversion.content.length; i ++) {
							var content = conversion.content[i];
							var decimal = cryptii.conversion.formats['rot18'].convertDecimal(
								cryptii.conversion.ord(content));
							conversion.splittedContent.push({
								content: content,
								decimal: decimal,
								result: null
							});
						}
					}
				},
				convert: {
					options: {
					},
					run: function(conversion, options) {
						for (var i = 0; i < conversion.splittedContent.length; i ++) {
							var entry = conversion.splittedContent[i];
							if (entry.decimal != null) {
								var decimal = cryptii.conversion.formats['rot18'].convertDecimal(
									entry.decimal);
								entry.result = cryptii.conversion.chr(decimal);
							}
						}
					}
				}
			},

			//
			// ROT 47
			//
			'rot47': {
				title: 'ROT47',
				url: 'http://en.wikipedia.org/wiki/ROT13',
				convertDecimal: function(decimal) {
					// convert single decimal block
					if (decimal >= 33 && decimal <= 126) {
						decimal += 47;
						if (decimal > 126)
							decimal -= 94;
					}
					return decimal;
				},
				interpret: {
					options: {
					},
					run: function(conversion, options) {
						conversion.isSplittedContentConversion = true;
						for (var i = 0; i < conversion.content.length; i ++) {
							var content = conversion.content[i];
							var decimal = cryptii.conversion.formats['rot47'].convertDecimal(
								cryptii.conversion.ord(content));
							conversion.splittedContent.push({
								content: content,
								decimal: decimal,
								result: null
							});
						}
					}
				},
				convert: {
					options: {
					},
					run: function(conversion, options) {
						for (var i = 0; i < conversion.splittedContent.length; i ++) {
							var entry = conversion.splittedContent[i];
							if (entry.decimal != null) {
								var decimal = cryptii.conversion.formats['rot47'].convertDecimal(
									entry.decimal);
								entry.result = cryptii.conversion.chr(decimal);
							}
						}
					}
				}
			},

			//
			// CATEGORY ENCODING
			//
			'catencoding': {
				title: 'Encoding'
			},

			//
			// BASE 64
			//
			'base64': {
				title: 'Base64',
				url: 'http://en.wikipedia.org/wiki/Base64',
				alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
				interpret: {
					options: {},
					run: function(conversion, options) {
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
								decimal: cryptii.conversion.ord(text[i]),
								result: null
							});
					}
				},
				convert: {
					options: {},
					run: function(conversion, options) {
						var alphabet = cryptii.conversion.formats['base64'].alphabet;
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
			},

			//
			// CATEGORY HASH
			//
			'cathash': {
				title: 'Hash'
			},

			//
			// MD5
			//
			'md5': {
				title: 'MD5',
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
			},

			//
			// SHA1
			//
			'sha1': {
				title: 'SHA-1',
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
			}
		},

		//
		// BASIC METHODS
		//
		ord: function(string) {
			var str = string + '',
			code = str.charCodeAt(0);
			if (0xD800 <= code && code <= 0xDBFF) {
				var hi = code;
				if (str.length === 1)
					return code;
				var low = str.charCodeAt(1);
				return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
			}
			return parseInt(code);
		},
		chr: function(codePt) {
			if (codePt > 0xFFFF) {
				codePt -= 0x10000;
				return String.fromCharCode(0xD800 + (codePt >> 10), 0xDC00 + (codePt & 0x3FF));	
			}
			return String.fromCharCode(codePt);
		},
		replaceAll: function(source, find, replace) {
			if (find == '.')
				return source.replace(/\./g, replace);
			return source.replace(new RegExp(find, "g"), replace);
		}
	};

	// application loop
	cryptii.loop = function() {
		// check if input content has changed
		if (cryptii.view.getInputContent() != cryptii.view.lastInputContent) {
			cryptii.conversion.inputContentHasChangedEvent();
			// input content has changed
			cryptii.view.hasInputContentChanged = true;
		}

		// check if any options have changed
		var interpretOptions = cryptii.conversion.interpretOptions;
		for (var key in interpretOptions) {
			var value = cryptii.view.getOptionValue(false, key);
			if (interpretOptions[key] != value) {
				interpretOptions[key] = value;
				cryptii.conversion.optionsHasChangedEvent();
			}
		}
		var convertOptions = cryptii.conversion.convertOptions;
		for (var key in convertOptions) {
			var value = cryptii.view.getOptionValue(true, key);

			if (convertOptions[key] != value) {
				convertOptions[key] = value;
				cryptii.conversion.optionsHasChangedEvent();
			}
		}

		// update content height
		cryptii.view.updateView();
	};

	// application initialisation
	cryptii.init = function() {
		// init view
		cryptii.view.init();
		// read url (and define first formats)
		cryptii.view.urlHasChangedEvent();
		// init conversion
		cryptii.conversion.init();
		// update selections
		cryptii.view.updateSelections();
		// update options
		cryptii.view.updateOptions();
		// leave flags on changed state
		cryptii.view.hasInputContentChanged = true;
		cryptii.view.hasFormatChanged = true;
		// start loop
		setInterval(cryptii.loop, 500);
		// initial loop call
		cryptii.loop();
		// focus input textarea
		// here using a hack to put the cursor at the end of the field
		// described here: http://stackoverflow.com/questions/12911236
		var cachedValue = cryptii.view.$inputTextarea.val();
		cryptii.view.$inputTextarea.val("");
		cryptii.view.$inputTextarea.focus();
		cryptii.view.$inputTextarea.val(cachedValue);
		// activate initialized flag
		cryptii.isInitialized = true;
	};

})($, window, document, cryptii, _gaq);
