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
	};
	
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
		return '<textarea class="input" name="' + info.name + '"></textarea>';
	};
	
	Templates.select = function(info) {
		var select = [];
		
		select.push('<select class="select" name="' + info.name + '">');
		
		_.each(info.options, function(option) {
			var value = (typeof option === 'string') ? option : option.value,
					label = option.label || _(value).capitalize();
			
			select.push('<option value="' + value + '">' + label + '</option>');
		});
		
		select.push('</select>');
		return select.join('');
	};
	
	Templates.text = function(info) {
		return '<input class="input" name="' + info.name + '" type="text">'
	};
	
	Templates.block = function(type, info) {
		var block = [],
				name = info.name,
				labelL = info.labelL;
		
		block.push('<ul class="block">');
		
		_.each(info.options, function(option) {
			var value = (typeof option === 'string') ? option : option.value,
					label = option.label || _(value).capitalize(),
					optionLabel = '<label class="label" for="' + info.name + '">'+ label +'</label>';
			
			block.push('<li class="block-item">');
				if (!labelL) { block.push(optionLabel) }
				block.push('<input class="input" type="'+ type +'" value="' + value + '" name="'+ info.name +'">');
				if (labelL) { block.push(optionLabel) }
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
		
		// .fill() fills the form fields
		fill: function(hash) {
			var fillHash = {};
			
			_.each(hash, function(value, index) {
				var selector = '[name="'+ index + '"]';
				fillHash[selector] = value;
			});
			
			this.$list.jFill(fillHash);
		},
		
		_getOpt: function(opt, data) {
			return data ? data[opt] || this.jForm.get(opt) : this.jForm.get(opt);
		},
		
		// a form is composed by rows
		render: function() {
			var formFields = [],
					_this = this;
			
			// instantiate the list
			this.$list = $('<ul class="field-list"></ul>').appendTo(this.$el);
			
			_.each(this.rows, function(row, index) {
				formFields = _.union(formFields, _this._row(row) );
			});
			
			_.each(formFields, function(field, index) {
				// save reference to each field input
				_this.fields.push(field);
				
				_this.$list.append(field.html.li);
			});
			
			// apply styles
			this._applyStylesheets();
			
			// after appending all fields, append a clear-float
			this.$list.append('<li style="clear: both;"></li>');
		},
		
		_setEvents: function() {
			var _this = this;
			
			this.$list.find('input').change(this._handleChange);
		},
		
		_handleChange: function(e) {
			var target = $(e.target),
					name = target.attr('name'),
					val = target.val();
			
			if (target.prop('type') != 'checkbox') {
				this.Model.set(name, val);
			} else {
				
				var checked = target.prop('checked'),
						checkedArr = this.Model.get(name) || [];
				
				// and set the checkbox group array
				if (checked) {
					checkedArr.push(val);
					
					// clone the old array, in order to trigger a change event on the form model
					checkedArr = _.clone(checkedArr);
				} else {
					checkedArr = _.without(checkedArr, val);
				}
				
				this.Model.set(name, checkedArr);
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
			var li = $('<li class="field"></li>'),
					label = this._label(field_data),
					input = this._input(field_data);
					
			li.append(label).append(input);
			
			// if it is a line-opener
			if (first) {
				li.css({ clear: 'both' });
			}
			
			var html = {
				li: li,
				label: label,
				input: input
			};
			
			return _.extend({ html: html }, field_data);
		},
		
		_input: function(field_data) {
			var input = $( Templates[field_data.type](field_data) );
			
			return input;
		},
		
		_label: function(field_data) {
			var label,
					labelCss = this._getOpt('labelCss', field_data),
					labelStyle = this._getOpt('labelStyle', field_data),
					labelName = field_data.labelName || _(field_data.name).capitalize();
			
			if (labelStyle == 'top') {
				label = $('<label class="label">' + labelName + '</label><br>');
			} else if (labelStyle == 'side') {
				label = $('<label class="label">' + labelName + '</label>');
			}
			
			return label;
		},
		
		_applyStylesheets: function() {
			var stylesheets = this._getOpt('stylesheets'),
					_this = this;
			
			_.each(stylesheets, function(css, selector) {
				_this.$el.find(selector).css(css);
			})
		}
		
		
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
		
		stylesheets: {
			'.label': {
				fontSize: '11pt'
			},
			'.input': {
				border: '1px solid #AAAAAA',
				padding: '3px 3px 3px 3px',
				margin: '0 0 0 0'
			},
			'.select': {
				border: '1px solid #AAA',
				width: '100px',
				padding: '2px 2px 2px 2px',
				backgroundColor: '#FFF'
			},
			'.field-list': {
				listStyle: 'none',
				padding: '0 0 0 0',
				margin: '0 0 0 0'
			},
			'.field': {
				lineHeight: '11pt',
				float: 'left',
				margin: '3px 5px 3px 5px',
				padding: '0 0 0 0',
				fontSize: '12pt'
			},
			'.block': {
				listStyle: 'none',
				padding: '0 0 0 0',
				margin: '4px 0 0 0'
			},
			'.block-item': {
				textAlign: 'center',
				margin: '4px 0 4px 0',
				fontSize: '11pt'
			},
			'.block-item *': {
				verticalAlign: 'middle',
			},
			'.block-item .input': {
				margin: '0 5px 0 5px'
			},
			'.block-item .label': {
				fontSize: '11pt'
			},
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
			el: this.$form,
			rows: this.rows,
			jForm: this,
			Model: this.Model
		});
		
		// after instantiating the view, set it with the default values
		this.View.fill(this.fields);
		
	};
	
	jForm.prototype.basicBuild = function() {
		this.$form = $('<form></form>');
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
