/**
 * paths to javascript and shims for stuff which don't support AMD
 */
'use strict';

require.config({
    // alias libraries paths
	baseUrl: '.',

    paths: {
        'angular': 'Lib/angular/angular',
        'domReady': 'Lib/requirejs-domready/domReady',
        'uiRouter': 'Lib/angular-ui-router/release/angular-ui-router',
        'uiBootstrap': 'Lib/angular-bootstrap/ui-bootstrap-tpls',
        'ngAnimate': 'Lib/angular-animate/angular-animate',
        'ngAria': 'Lib/angular-aria/angular-aria',
        'ngMaterial': 'Lib/angular-material/angular-material',

        'controller': 'JS/controller',
        // These  is specific to 3dshape - has mdPopover and mdModeless
		'mdModeless': 'Directives/modeless',
		'myDraggable': 'Directives/mydraggable',
        // Factory function
        
        // Application
        'app': 'app'
    },

    // libraries which do not support AMD out of the box, put it in a shim
    shim: {
        'angular': {
            exports: 'angular'
        },
        'uiRouter': {
            deps: ['angular']
        },
        'uiBootstrap': {
            deps: ['angular']
        },
        'ngAria': {
            deps: ['angular'],
            exports: 'ngAria'
        },
        'ngAnimate': {
            deps: ['angular'],
            exports: 'ngAnimate'
        },
        'ngMaterial': {
            deps: ['angular', 'ngAnimate', 'ngAria'],
            exports: 'ngMaterial'
        },
        'myDraggable': {
			deps: ['ngMaterial', 'angular'],
			exports: 'myDraggable'
		},
		'mdModeless': {
			deps: ['ngMaterial', 'myDraggable', 'angular'],
			exports: 'mdModeless'
		}
    }
});

define("main", [
    'require',
    'angular',
    'app'
], function (require, ng) {
    require(['domReady!'], function (document) {
        ng.bootstrap(document, ['app']);
    });
});


