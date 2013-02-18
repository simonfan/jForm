define(['jquery'], function($) {
		
	// This var holds functions that try to place data TAG-wisely.
	// You may modify the default behaviour by calling 
	// .jFill('customize', tagName, function($el, val) { });
	var tagFuncs = {
		'default': function($el, value) { $el.html(value); },
		'IMG': function($el, value) { $el.attr('src', value); },
		'SCRIPT': function($el, value) { $el.attr('src', value); },
		'TEXTAREA': function($el, value) { $el.val( value ) },
		'INPUT': function($el, value) {
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
					var filter;
					
					if (typeof value === 'string') {
						filter = function() {
							return $(this).val() == value;
						}
					} else {
						filter = function() {
							return $.inArray( $(this).val(), value) > -1;
						}
					}
					
					$el.filter(filter).attr('checked', true);
					break;
			}
		},
		'SELECT': function($el, value) {
			$el.find('option').filter(function() {
				return $(this).val() == value;	
			}).attr('selected', true);
		}
	};
	
	var selectorFuncs = {
		id: function(hash) {
			return '#' + hash;
		},
		'class': function(hash) {
			return '.' + hash;
		},
		attr: function(hash, attrName) {
			return '[' + attrName + '="' + hash + '"]';
		}
	};
	
	// The jFill function receives as first parameter a hash containing
	// { fieldName: fieldValue }. The fieldName will be matched according to the
	// 'identifier' (id, class or attr). If no identifier is passed, the default 
	// identifier is the 'id'.
	
	// If the identifier passed is 'attr', you must provide an 'attrName' to be
	// checked against.
	
	// If the first parameter passed happens to be a string or an array, 
	// the function will assume that the element of the jquery selection should 
	// be filled in directly, so it will be passed to the 'tagFuncs',
	// which decide the right action to apply when told to 'fillIn' a html tag.
	function jFill(value_or_values, identifier, attrName) {
		var _this = this;
		
		if (typeof value_or_values === 'string' || $.isArray(value_or_values) ) {
			var tag = this.prop('tagName'),
					func = tagFuncs[tag] || tagFuncs['default'];
				
			func(this, value_or_values);
		} else if (typeof value_or_values === 'object') {
			var buildSelector = selectorFuncs[identifier] || selectors['id'];
			
			$.each(value_or_values, function(index, value) {
				var selector = buildSelector(index, attrName),
					element = _this.find(selector);
					
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
