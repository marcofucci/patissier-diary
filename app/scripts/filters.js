'use strict'

////// Filters //////

angular.module('app.filters', [])

.filter('interpolate', ['version', function(version) {
  return function(text) {
    return String(text).replace(/\%VERSION\%/mg, version);
  }
}
])

.filter('nl2br', function() {
  return function(text) {
    if (typeof text !== 'undefined' && text) {
      return text.replace(/\n/g, '<br/>');
    } else {
      return;
    }
  };
})

.provider('$home', function() {
  this.$get = [function() {
    return function(text) {
      if (text !== undefined && text) {
        return text.replace('$HOME', process.env.HOME);
      }
      return text;
    }
  }];
})
.filter('home', ['$home', function($home) {
  return $home;
}])
;
