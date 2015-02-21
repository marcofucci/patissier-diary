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

App.config(function() {
  var gui = require('nw.gui');
  var win = gui.Window.get();
  var nativeMenuBar = new gui.Menu({ type: "menubar" });
  try {
    nativeMenuBar.createMacBuiltin("My App");
    win.menu = nativeMenuBar;
  } catch (ex) {
    console.log(ex.message);
  }
});