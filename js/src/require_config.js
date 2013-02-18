require.config({
	urlArgs: "bust=" + Math.random(),
	baseUrl: 'js',
	paths: {
		'jquery': 'lib/jquery',
		'underscore': 'lib/underscore',
		'backbone': 'lib/backbone',
		'utils': 'lib/utils',
		'app': 'src/app',
		
		'jfill': 'lib/jfill',
		
		'demo': 'src/demo',
		
		'qunit': 'lib/qunit',
		'unit': 'test/unit'
	},
	shim: {
		'backbone': {
			deps: ['underscore', 'jquery'],
			exports: 'Backbone'
		},
		'app': {
			deps: ['jquery','underscore','backbone']
		},
		'unit': {                   
			deps: ['jquery','underscore','backbone','app']
		}
	}
});

if ( document.getElementById('unit-test-page') ) {
	// tell the QUnit not to autostart as we are asynchronously loading tests
	QUnit.config.autostart = false;
	
	// load the testing
	require(['unit'], function(unit) {
		
		console.log('initializing tests');
		QUnit.start();
		
	});
	
} else {
	
	// load the main app page
	require(['demo'], function(demo) {
		
	});
}


