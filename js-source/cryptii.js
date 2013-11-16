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
		// links
		githubFormatCodeBaseUrl: 'https://github.com/the2f/Cryptii/blob/master/js-source/conversion/formats/',
		// conversion
		defaultInterpretFormat: 'text',
		defaultConvertFormat: 'decimal'
	};

	// initialized flag
	cryptii.isInitialized = false;

	// application loop
	cryptii.loop = function() {
		// check if input content has changed
		if (cryptii.view.getInputContent() != cryptii.view.lastInputContent) {
			cryptii.conversion.inputContentHasChangedEvent();
			// input content has changed
			cryptii.view.hasInputContentChanged = true;
		}

		// check if any options have changed
		var interpretOptions = cryptii.conversion.getInterpretOptions();
		for (var name in interpretOptions)
		{
			var option = interpretOptions[name];
			var fieldValue = cryptii.view.getOptionValue(false, name);

			if (option.value != fieldValue)
				cryptii.conversion.setInterpretOption(name, fieldValue);
		}

		var convertOptions = cryptii.conversion.getConvertOptions();
		for (var name in convertOptions)
		{
			var option = convertOptions[name];
			var fieldValue = cryptii.view.getOptionValue(true, name);

			if (option.value != fieldValue)
				cryptii.conversion.setConvertOption(name, fieldValue);
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
		// update url
		//  this removes the data from
		//  the shared link (if available)
		cryptii.view.updateUrl();
		// update interpret selections
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
		// launch conversion for the first time
		cryptii.conversion.launch();
	};

})($, window, document, cryptii, _gaq);
