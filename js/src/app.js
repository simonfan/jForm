define(['jquery','backbone','underscore','jfill'],
function(   $   , Backbone , underscore , jfill) {
	
	////////////////////////////////////
	////////// UTILS ///////////////////
	////////////////////////////////////
	
	// validates any object by verifying properties and respective typeofs
	function validateObj(obj, props) {
		/*
			props:
				prop: typeof prop (str)
		*/
		
		_.each(props, function(expected_type, prop_name) {
			
			if (!obj[prop_name]) {
				throw new Error("There is no '" + prop_name + "' in " + obj);
			}
			
			var actual_type = typeof obj[prop_name];
			
			if (actual_type != expected_type) {
				throw new TypeError("The property '" + prop_name + "' from " + obj + " is not a '" + expected_type + "' but a '" + actual_type + "'");
			}
		});
		
		return true;
	}
	
	
	_.mixin({
		capitalize : function(string) {
    	return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
  	}
	});
	
	////////////////////////////////////
	////////// DEFAULT STYLING /////////
	////////////////////////////////////
	
	
	
	////////////////////////////////////
	////////// TEMPLATING //////////////
	////////////////////////////////////
	
	var Templates = {};
	
	Templates.textarea = function(info) {
		return '<textarea name="' + info.name + '"></textarea>';
	};
	
	Templates.select = function(info) {
		var select = [];
		
		select.push('<select name="' + info.name + '">');
		
		_.each(info.options, function(option) {
			var value = (typeof option === 'string') ? option : option.value,
					label = option.label || _(value).capitalize();
			
			select.push('<option value="' + value + '">' + label + '</option>');
		});
		
		select.push('</select>');
		return select.join('');
	};
	
	Templates.text = function(info) {
		return '<input name="' + info.name + '" type="text">'
	};
	
	Templates.block = function(type, info) {
		var block = [],
				name = info.name,
				labelR = info.labelR;
		
		block.push('<ul>');
		
		_.each(info.options, function(option) {
			var value = (typeof option === 'string') ? option : option.value,
					label = option.label || _(value).capitalize(),
					optionLabel = '<label for="' + info.name + '">'+ label +'</label>';
			
			block.push('<li>');
				if (!labelR) { block.push(optionLabel) }
				block.push('<input type="'+ type +'" value="' + value + '" name="'+ info.name +'">');
				if (labelR) { block.push(optionLabel) }
			block.push('</li>');
		});
		
		block.push('</ul>');
		return block.join('');
	};
	
	
	Templates.checkblock = function(info) {
		return Templates.block('checkbox', info);
	};
	
	Templates.radioblock = function(info) {
		return Templates.block('radio', info);
	};
	
	////////////////////////////////////
	///////// BUILD LINE ///////////////
	////////////////////////////////////
		
	var Form = {};
	
	Form.Model = Backbone.Model.extend({
		
		initialize: function(attr, options) {
			_.bindAll(this);
			
			this.options = options;
			this.jForm = options.jForm;
			
			// handle changes
			this.on('change', this._handleChange);
		},
		
		_handleChange: function(model, options) {
			console.log(this.changed);
		}
		
	});
	
	Form.View = Backbone.View.extend({
		tagName: 'ul',
		
		initialize: function(options) {
			_.bindAll(this);
			
			var _this = this;
			
			this.options = options;
			this.jForm = options.jForm;
			this.rows = options.rows;
			
			this.Model = options.Model;
			
			// array that holds reference to all field objects
			// field: { input, li, label }
			this.fields = [];
			this.render();
			
			// after having rendered all hte input fields, handle changes on them
			this._setEvents();
		},
		
		_getOpt: function(opt, data) {
			return data[opt] || this.jForm.get(opt);
		},
		
		// a form is composed by rows
		render: function() {
			var formFields = [],
					_this = this;
			
			_.each(this.rows, function(row, index) {
				formFields = _.union(formFields, _this._row(row) );
			});
			
			_.each(formFields, function(field, index) {
				// save reference to each field input
				_this.fields.push(field);
				
				_this.$el.append(field.html.li);
			});
			
			// after appending all fields, append a clear-float
			this.$el.append('<li style="clear: both;"></li>');
		},
		
		_setEvents: function() {
			var _this = this;
			
			this.$el.find('input').change(this._handleChange);
		},
		
		_handleChange: function(e) {
			var target = $(e.target),
					name = target.attr('name'),
					val = target.val();
			
			if (target.prop('type') != 'checkbox') {
				this.Model.set(name, val);
			} else {
				this.Model.set(val, target.prop('checked') );
			}
		},
		
		// a row is composed of fields
		_row: function(field_or_fields) {
			var row_field_objects = [],
					_this = this;
			
			if ( _.isArray(field_or_fields) ) {
				_.each(field_or_fields, function(field, index) {
					var isFirst = index == 0;
					
					row_field_objects.push( _this._field(field, isFirst) );
				});
				
			} else {
				row_field_objects.push( _this._field(field_or_fields, true) );
			}
			
			return row_field_objects;
		},
		
		// field is the data object passed in to instantiate a field
		// 'first' is a boolean indicating whether the field is the first of the line
		_field: function(field_data, first) {
			var li = $('<li></li>'),
					fieldCss = this._getOpt('fieldCss', field_data),
					label = this._label(field_data),
					input = this._input(field_data);
					
			li.append(label).append(input);
			
			// if it is a line-opener
			if (first) {
				fieldCss = _.extend({}, fieldCss, { clear: 'both' });
			}
			
			li.css(fieldCss);
			
			var html = {
				li: li,
				label: label,
				input: input
			}
			
			return _.extend({ html: html }, field_data);
		},
		
		_input: function(field_data) {
			var input = $( Templates[field_data.type](field_data) ),
					inputCss = this._getOpt('inputCss', field_data);
			
			if (inputCss) {
				input.css(inputCss);
			}
			
			return input;
		},
		
		_label: function(field_data) {
			var label,
					labelCss = this._getOpt('labelCss', field_data),
					labelStyle = this._getOpt('labelStyle', field_data),
					labelName = field_data.labelName || _(field_data.name).capitalize();
			
			if (labelStyle == 'top') {
				label = $('<label>' + labelName + '</label><br>');
			} else if (labelStyle == 'side') {
				label = $('<label>' + labelName + '</label>');
			}
			
			if (label && labelCss) {
				label.css(labelCss);
			}
			
			return label;
		},
		
		
	});
	
	
	////////////////////////////////////
	//////// OBJECTS ///////////////////
	////////////////////////////////////
	
	// rows:
	// [ [field, field, field], field, [field, field] ]
	
	// row:
	// [field, field, field];
	//
	// field: 
	// - name, *
	// - tagname, 				// html TAGNAME
	// - type, 
	// - labelName,
	// - labelStyle,
	// - placeholder, 
	// - defaultValue,
	// - css: { li, input, label },
	// - style[object || string], 
	// - attr[object]
	
	var Defaults = {
		tagname: 'input',
		type: 'text',
		inputCss: {},
		
		labelName: 'your labelName here',
		labelStyle: 'top',
		
		labelCss: {
		
		},
		
		ulCss: {
			listStyle: 'none',
			padding: '0 0 0 0',
			margin: '0 0 0 0'
		},
		
		fieldCss: {
			float: 'left',
			margin: '5px 5px 5px 5px',
			padding: '0 0 0 0',
			fontSize: '12pt'
		},
		
		Model: Form.Model,
		View: Form.View
	};
	
	///////////////////////////////////////
	//////////// JFORM ////////////////////
	///////////////////////////////////////
	
	var jForm = function(data) {
		_.bindAll(this);
		
		this.frame = data.frame;
		this.$frame = $(data.frame);
		
		this.rows = data.rows;
		this.options = _.extend({}, Defaults, data.options);
		
		this.fieldObjects = _.flatten(this.rows);
		this.fields = this.extractFieldValues();
		
		this.Model = new this.options.Model(this.fields, { jForm: this });
		
		
		this.basicBuild();
		
		this.View = new this.options.View({
			el: this.$formUl,
			rows: this.rows,
			jForm: this,
			Model: this.Model
		});
	};
	
	jForm.prototype.basicBuild = function() {
		var ulCss = this.get('ulCss');
		
		this.$form = $('<form></form>');
		this.$formUl = $('<ul></ul>').appendTo(this.$form);
		
		if (ulCss) {
			this.$formUl.css(ulCss);
		}
		
		this.$frame.append(this.$form);
	};
	
	jForm.prototype.extractFieldValues = function() {
		var fieldObjects = this.fieldObjects,
				fieldNames = _.pluck(fieldObjects, 'name'),
				fieldDefaults = _.pluck(fieldObjects, 'default'),
				fields = _.object(fieldNames, fieldDefaults);
		
		console.log('field names', fieldNames);
		console.log('field defaults', fieldDefaults);
		console.log(fields);
		
		this.fields = fields;
		
		return fields;
	};
	
	jForm.prototype.set = function(opt, val) {
		if (typeof opt === 'object') {
			for (option in opt) {
				if ( opt.hasOwnProperty(option) ) {
					this.options[option] = opt[option];
				}
			}
		} else if (typeof opt === 'string') {
			this.options[opt] = val;
		}
		return this;
	};
	
	jForm.prototype.get = function(opt) {
		return this.options[opt];
	};
	
	//////////////////////////////////////////////////
	///////////////// GLOBAL SETTINGS ////////////////
	//////////////////////////////////////////////////
	jForm.set = function(opt, val) {
		
		if (typeof opt === 'object') {
			for (option in opt) {
				if ( opt.hasOwnProperty(option) ) {
					Defaults[option] = opt[option];
				}
			}
		} else if (typeof opt === 'string') {
			Defaults[opt] = val;
		}
		return this;
	};
	
	jForm.get = function(opt) {
		return Defaults[opt];
	};
	
	$.fn.jForm = function ( first, second ) {
		if (typeof first === 'string') {
			// the first is a method, run the called method passing as argument the second
			var args = Array.prototype.splice.call(arguments, 1);
			
			return jForm[first].apply(this, args);
			
		} else if ( _.isArray(first) ) {
			// the first argument is an array, so it is a form builder
			return new jForm({
				frame: this,
				rows: first,
				options: second
			});
		}
	}
	
	return jForm;
});
