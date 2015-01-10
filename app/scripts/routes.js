'use strict';
(function(){
//ROUTES
  angular.module('app.routes', [])
    .config(['$stateProvider', '$locationProvider',
    function($stateProvider, $locationProvider) {
      $locationProvider.html5Mode(true);
      var states = angular.module('app.states').getStates();
      angular.forEach(states, function(stateDefinition){
        $stateProvider.state(stateDefinition);
      });
    }]);
})();
