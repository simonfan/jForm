define(['jquery'], function($) {
		
	
	// this function checks if the plugin is instantiated and runs the 
	// right callback function (yes or no)
	function isInstantiated(element, actions) {
		
		var pluginObj = $.data(element, pluginName);
		
		if (pluginObj) {
			actions.yes(pluginObj);
		} else {				
			actions.no();
		}
	}
	
	// this function checks if the responseArr is composed of only one value
	// and if so, it responds with the value directly instead of an array
	function respond(responseArr) {
		// if the responseArr.length is only 1, then just return the value
		if (responseArr.length == 1) {
			return responseArr[0];
			
		} else if (responseArr.length == 0) {
			return false;
			
		} else if (responseArr.length > 1) {
			return responseArr;	
		}
	}
	
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
	
	
	// function checks if is array or string
	function arrStr(i) {
		
		/*
			i:
				- obj,*
				- funcs:*
					- str,	*
					- arrItem,	*
					- arr,	*
					- objItem,
					- obj
				- context
		*/
		
		var type = typeof i.obj;
		
		if (type === 'string') {
			
			i.funcs.str.call(i.context, i.obj);
			
		} else if ( _.isArray(i.obj) ) {
			
			// the obj is an array
			
			if (i.funcs.arrItem) {
				
				// iterate over the object,
				// the i.funcs.arrItem requires the value inside the array
				_.each(i.obj, function(val, index) {
					i.funcs.arrItem.call(i.context, val, index);
				});
				
			} else {
				
				// return the array to the function
				// the i.funcs.arr requires the 'array' itself
				i.funcs.arr.call(i.context, i.obj);
				
			}
			
			
		} else {
			// it is an object
			
			if (i.funcs.obj) {
				// if there is a special function to objects, run it
				i.funcs.obj.call(i.context, i.obj);
				
			} else {
				// else run the function dedicated to arrays
				i.funcs.arr.call(i.context, i.obj);
			}
		}
	}	
	
	// Utils area!
	var Utils = {
		isInstantiated: isInstantiated,
		respond: respond,
		validateObj: validateObj,
		arrStr: arrStr
	}
	
	return Utils;	
});
