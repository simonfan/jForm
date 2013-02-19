/* ------------------------------------------------ *\
	jFill
	jQuery plugin for filling up html elements with data in an intelligent manner.
	
	version: 1.0.1
\* ------------------------------------------------ */

define(['jquery'], function($) {
		
	// This var holds functions that try to place data TAG-wisely.
	// You may modify the default behaviour by calling 
	// .jFill('customize', tagName, function($el, val) { });
	var tagFuncs = {
		'default': function($el, value) {
			// trigger a change event when changing the innerHTML
			$el.html(value).trigger('change');
		},
		'IMG': function($el, value) {
			// trigger a change event when changing the image src
			$el.attr('src', value).trigger('change');
		},
		'TEXTAREA': function($el, value) { $el.val( value ).trigger('change'); },
		'INPUT': function($el, value) {
			// always remember: $el may be a collection of inputs
			
			switch( $el.attr('type') ) {
				case 'text':
					$el.val(value);
					break;
					
				case 'radio':
					$el.filter(function() {
						return $(this).val() == value;	
					}).attr('checked', true);
					break;
					
				case 'checkbox':
					var checkFunc;
					
					if (typeof value === 'string') {
						checkFunc = function(el) {
							return $(el).val() == value;
						}
					} else if ( _.isArray(value) ) {
						checkFunc = function(el) {
							return $.inArray( $(el).val(), value) > -1;
						}
					}
					
					$el.each(function(index, el) {
						if ( checkFunc(el) ) {
							$(el).prop('checked',true);
						} else {
							$(el).prop('checked',false);
						}
					});
					
					break;
			}
					
			$el.trigger('change');
		},
		'SELECT': function($el, value) {
			$el.find('option').filter(function() {
				return $(this).val() == value;	
			}).attr('selected', true);
			
			$el.trigger('change');
		},
		
		// errors
		'SCRIPT': function($el, value) { throw new Error('Are you sure you want to fill in a <script> tag? If so, provide us your custom fill in function'); }
	};
	
	// The jFill function receives as first parameter a hash containing
	// { selector: fieldValue }. The selector is used to find the element to
	// be filled
	
	// If the identifier passed is 'attr', you must provide an 'attrName' to be
	// checked against.
	
	// If the first parameter passed happens to be a string or an array, 
	// the function will assume that the element of the jquery selection should 
	// be filled in directly, so it will be passed to the 'tagFuncs',
	// which decide the right action to apply when told to 'fillIn' a html tag.
	function jFill(value_or_values) {
		var _this = this;
		
		if (typeof value_or_values === 'string' || $.isArray(value_or_values) ) {
			var tag = this.prop('tagName'),
					func = tagFuncs[tag] || tagFuncs['default'];
				
			func(this, value_or_values);
		} else if (typeof value_or_values === 'object') {
			
			$.each(value_or_values, function(selector, value) {
				var element = _this.find(selector);
					
				element.jFill(value);
			});
		}
	}
	
	function customize(tagName, func) { tagFuncs[tagName] = func; }
	
	$.fn.jFill = function ( first, second, third ) {
		if (typeof first === 'object') {
			jFill.apply(this, arguments);
		} else if (typeof first === 'string' && !second) {
			jFill.apply(this, arguments);
		} else if (typeof first === 'string' && typeof third === 'function') {
			var args = Array.prototype.slice.call(arguments, 1);
			customize.apply(this, args);
		}
		
		return this;
	}
});
