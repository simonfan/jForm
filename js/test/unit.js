var deps = ['jquery','app','backbone','underscore','utils'];

define(deps, function($, app, Backbone, underscore, Utils, undefined) {
		
	module('Basic initialization testing');
	
	test('jquery ($) presence', function() {
			
		ok(jQuery, 'Expect jQuery object to exist');
		ok($, 'Expect $ object to exist');
	});
	
	test('underscore presence', function() {
		ok(_, 'Expect _');
		ok(_.each, 'Expect _.each');
	});
	
	test('Backbone presence', function() {
		ok(Backbone, 'Expect Backbone');
		ok(Backbone.Model, 'Expect Backbone.Model');
		ok(Backbone.View, 'Expect Backbone.View');
	});
	
	module('Utils testing');
	
	test('Util presence', function() {
		
		ok(Utils);
	});
	
	test('validateObj', function() {
		
		var obj = {
				func: function() {},
				string: 'string',
				obj: {}
			}, 
			props = {
				func: 'function',
				string: 'string',
				obj: 'object'
			}
			
		ok( Utils.validateObj(obj, props), 'expect the validation to return true' )
			
	});
	
	
	
	test('arrStr: test the string and the arrItem functionalities', function() {
		
		var	test = {
				str: 'test string',
				arr: ['arr1','arr2','arr3'],
				obj: {
					obj1: 'val1',
					obj2: 'val2',
					obj3: 'val3'
				}
			};
			
		// first test the string and the arrItem functionalities
		function doTest(obj, c) {
		
			Utils.arrStr({
				obj: obj,
				funcs: {
					str: function(val) {
						c.string = val;
					},
					arrItem: function(val, index) {
						c.arr.push(val);
					},
					arr: function(arr) {
						c.arr.push(arr);
					}
				}
			});
		}
		
		var controlStr = {
				string: false,
				arr: []
			};
			

		
		// test using str
		doTest(test.str, controlStr);
		
		equal(controlStr.string, test.str, 'expect the function str to be used');
		notEqual(controlStr.arr[0], test.str, 'expect the function arrItem not to be used');
		
		
		
		var controlArrItem = {
				string: false,
				arr: []
			};
		
		// test using arrItem
		doTest(test.arr, controlArrItem);
		
		deepEqual(controlArrItem.arr, test.arr, 'expect the function arrItem to be used');
		ok(!controlArrItem.str, 'expect the function str not to be used');
		
		

		
		
		// test using arr
		function doTestWithoutArrItem(obj, c) {
		
			Utils.arrStr({
				obj: obj,
				funcs: {
					str: function(val) {
						c.string = val;
					},
					arr: function(arr) {
						c.arr = arr;
					}
				}
			});
		}			
		
		var controlArr = {
				string: false,
				arr: false
			};
			
		doTestWithoutArrItem(test.arr, controlArr);
		
		deepEqual(controlArr.arr, test.arr, 'expect the function arr to be used');
		
		ok(!controlArr.str, 'expect the function str not to be used');
	});
		
});
