// app.js

define([
    'angular',
    'uiRouter',
    'uiBootstrap',
    'controller',
    
    // Third party stuff
    'ngAria',
    'ngAnimate',
    'ngMaterial',
    'mdModeless',
    'myDraggable'
], function (ng) {
    'use strict';

    return ng.module('app', ['ui.router', 'ngAria', 'ngAnimate', 'ngMaterial','mdModeless', 'myDraggable'])
        .config(['$stateProvider', '$urlRouterProvider', '$locationProvider',
            function ($stateProvider, $urlRouterProvider, $locationProvider) {

                $stateProvider.state('app', {
                    url: '/',
                    views: {
                        'content': {
                            templateUrl: 'defaultcontent.tpl.html',
                            controller: 'myController'
                        }
                    }
                });

                $urlRouterProvider.otherwise('/');

            }]);
});
