'use strict'

// Declare app level module which depends on filters, and services
var App = angular.module('app', [
  'ngCookies',
  'ngResource',
  'ngRoute',
  'app.states',
  'angularMoment',
  'textAngular',
  'ui.bootstrap',
  'ui.router',
  'app.routes',
  'app.services',
  'app.controllers',
  'app.directives',
  'app.filters',
  'partials'
]);


App.run(['$state', function($state) {
  // $state.go('dashboard');
  $state.go('type_detail', {typeId: 1});
}]);
// App.config([
//   '$routeProvider',
//   '$locationProvider',
//   function($routeProvider, $locationProvider, config) {

//     $routeProvider
//       .when('/dashboard', {templateUrl: '/partials/dashboard.html'})
//       .when('/view1', {templateUrl: '/partials/partial1.html'})
//       .when('/view2', {templateUrl: '/partials/partial2.html'})

//       // Catch all
//       .otherwise({redirectTo: '/dashboard'});

//     //Without server side support html5 must be disabled.
//     $locationProvider.html5Mode(false);
//   }
// ]);


// App.run([
//   'db'

// (db) ->
//   db.install()
// ])