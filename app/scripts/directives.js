'use strict'

////// Directives //////

// register the module with Angular
angular.module('app.directives', [
  // require the 'app.service' module
  'app.services'
])

.directive('ngReallyClick', [
function() {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      element.bind('click', function() {
        var message = attrs.ngReallyMessage;
        if (message && confirm(message)) {
          scope.$apply(attrs.ngReallyClick);
        }
      });
    }
  };
}
]);
