//
// Cryptii
// View
//

(function($, window, document, cryptii, _gaq) {
	
	"use strict";

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
		viewMode: -1,
		
		init: function() {

			// allow click outside application frame to close
			$('html').click(function() {
				// reset view mode
				if (cryptii.view.viewMode != 0)
					cryptii.view.setViewMode(0, true);
			});

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
			cryptii.view.$outputField.removeClass();

			// add format classes to fields
			cryptii.view.$inputField.addClass(result.options.interpret.format);
			cryptii.view.$outputField.addClass(result.options.convert.format);

			// add result content to output field
			if (result.resultHtml == null)
				// text result
				cryptii.view.$outputField.text(result.result);
			else
				// html result
				cryptii.view.$outputField.html(result.resultHtml);
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
			// update class
			$('#application')
				.attr('class', '')
				.addClass('view-' + viewMode);
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
			for (var format in cryptii.conversion.formats)
			{
				var formatDef = cryptii.conversion.formats[format];

				// create convert selection when cryptii is initialized
				//  to apply the preview on the input content
				if (!cryptii.isInitialized) {

					if (formatDef.interpret != undefined) {

						// add category if needed
						if (lastInterpretCategory != formatDef.category)
						{
							var $category = $(document.createElement('div'))
								.text(formatDef.category)
								.addClass('category');

							cryptii.view.$interpretSelection.append($category);
							lastInterpretCategory = formatDef.category;
						}

						// create example div
						var $example = $(document.createElement('span'))
							.addClass('example');

						// add text or html array to example
						var preview = cryptii.conversion.convertPreviewContent(format, false);
						if (typeof preview == 'string')
							$example.text(preview);
						else
							$example.html(preview);

						// add format to convert selection
						var $format = $(document.createElement('div'))
							.addClass('format')
							.append(
								$(document.createElement('span'))
									.addClass('title')
									.text(formatDef.title),
								$example
							);

						// click event
						$format.click($.proxy(function(event) {
							// change format
							cryptii.conversion.setInterpretFormat(this.format);
							// reset view mode
							cryptii.view.setViewMode(0, true);
						}, { format: format }));

						// view it
						cryptii.view.$interpretSelection.append($format);
					}
				}

				if (formatDef.convert != undefined) {
					// add category if needed
					if (lastConvertCategory != formatDef.category)
					{
						var $category = $(document.createElement('div'))
							.text(formatDef.category)
							.addClass('category');

						cryptii.view.$convertSelection.append($category);
						lastConvertCategory = formatDef.category;
					}

					// create example div
					var $example = $(document.createElement('span'))
						.addClass('example');

					// add text or html array to example
					var preview = cryptii.conversion.convertPreviewContent(format, true);
					if (typeof preview == 'string')
						$example.text(preview);
					else
						$example.html(preview);

					// add format to convert selection
					var $format = $(document.createElement('div'))
						.addClass('format')
						.append(
							$(document.createElement('span'))
								.addClass('title')
								.text(formatDef.title),
							$example
						);

					// click event
					$format.click($.proxy(function(event) {
						// change format
						cryptii.conversion.setConvertFormat(this.format);
						// reset view mode
						cryptii.view.setViewMode(0, true);
					}, { format: format }));
					
					// view it
					cryptii.view.$convertSelection.append($format);
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
			var interpretOptions = cryptii.conversion.getInterpretOptions();

			if (Object.keys(interpretOptions).length > 0) {
				for (var name in interpretOptions)
				{
					var option = cryptii.view.createOption(interpretOptions[name]);
					// append field to view
					cryptii.view.$interpretOptions.append(option.$option);
					// store field to track updates
					cryptii.view.$interpretOptionFields[name] = option.$field;
				}
			}

			// interpret options
			var convertOptions = cryptii.conversion.getConvertOptions();

			if (Object.keys(convertOptions).length > 0) {
				for (var name in convertOptions)
				{
					var option = cryptii.view.createOption(convertOptions[name]);
					// append field to view
					cryptii.view.$convertOptions.append(option.$option);
					// store field to track updates
					cryptii.view.$convertOptionFields[name] = option.$field;
				}
			}
		},

		createOption: function(option) {
			var field = null;
			if (option.type == 'text')
			{
				field = $(document.createElement('input'))
					.attr('type', 'text')
					.addClass('text')
					.val(option.value);
			}
			else if (option.type == 'boolean')
			{
				field = $(document.createElement('input'))
					.attr('type', 'checkbox')
					.prop('checked', option.value)
					.addClass('checkbox');
			}
			else if (option.type == 'slider')
			{
				field = $(document.createElement('div'))
					.slider({
						range: 'max',
						min: option.minimum,
						max: option.maximum,
						value: option.value
					})
					.addClass('slider');
			}
			else if (option.type == 'select')
			{
				field = $(document.createElement('select'))
					.addClass('select');
				$.each(option.options, function(key, title) {
					// add each option to select
					field.append(
						$(document.createElement('option'))
						.text(title)
						.attr('value', key)
						.prop('selected', key == option.value)
					);
				});
			}

			return {
				$option: $(document.createElement('div'))
					.addClass('option')
					.append(
						$(document.createElement('label'))
							.text(option.title),
						field),
				$field: field
			};
		},

		getOptionValue: function(isConvertOption, name) {
			// if isConvertOption, use convert options,
			//  if not use interpret options
			// collect information
			var optionDef = isConvertOption
				? cryptii.conversion.getConvertOption(name)
				: cryptii.conversion.getInterpretOption(name);
			var optionField = isConvertOption
				? cryptii.view.$convertOptionFields[name]
				: cryptii.view.$interpretOptionFields[name];
			// read value of this option field
			var value = null;
			if (optionDef.type == 'text')
				value = optionField.val();
			else if (optionDef.type == 'boolean')
				value = optionField.prop('checked');
			else if (optionDef.type == 'slider')
				value = optionField.slider('option', 'value');
			else if (optionDef.type == 'select')
				value = optionField.val();
			return value;
		},

		updateToolbox: function() {

			// get format definitions
			var interpretFormat = cryptii.conversion.interpretFormat;
			var interpretFormatDef = cryptii.conversion.formats[interpretFormat];

			var convertFormat = cryptii.conversion.convertFormat;
			var convertFormatDef = cryptii.conversion.formats[convertFormat];

			// collect information
			var githubFormatCodeBaseUrl = cryptii.options.githubFormatCodeBaseUrl;

			// clear toolboxes
			cryptii.view.$interpretToolbox.html('');
			cryptii.view.$convertToolbox.html('');

			// interpret toolbox
			if (interpretFormatDef.url != null) {

				// help link
				cryptii.view.$interpretToolbox.append(
					$(document.createElement('a'))
						.addClass('help')
						.attr('href', interpretFormatDef.url)
						.attr('target', '_blank')
						.attr('title', 'Read more about ' + interpretFormatDef.title)
						.text(interpretFormatDef.title));

				// code link
				cryptii.view.$interpretToolbox.append(
					$(document.createElement('a'))
						.addClass('code')
						.attr('href', githubFormatCodeBaseUrl + interpretFormat + '.js')
						.attr('target', '_blank')
						.attr('title', 'Show source code')
						.text('Show source code'));
			}

			// convert toolbox
			if (convertFormatDef.url != null) {

				// help link
				cryptii.view.$convertToolbox.append(
					$(document.createElement('a'))
						.addClass('help')
						.attr('href', convertFormatDef.url)
						.attr('target', '_blank')
						.attr('title', 'Read more about ' + convertFormatDef.title)
						.text(convertFormatDef.title));

				// code link
				cryptii.view.$convertToolbox.append(
					$(document.createElement('a'))
						.addClass('code')
						.attr('href', githubFormatCodeBaseUrl + convertFormat + '.js')
						.attr('target', '_blank')
						.attr('title', 'Show source code')
						.text('Show source code'));
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

})($, window, document, cryptii, _gaq);
