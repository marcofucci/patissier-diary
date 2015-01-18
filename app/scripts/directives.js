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
])

.directive('notesForm', ['$timeout', 'db', function($timeout, db) {
    return  {
      restrict: 'E',
      require: 'ngModel',
      templateUrl:  '/partials/notes_form.html',
      scope: {
        model: '=ngModel',
        ref: '@ngModel'
      },
      link: function(scope) {
        var saveDelay = 100,
            timeout = null,
            saveInProgress = false,
            saveFinished = function() {
              saveInProgress = false;
            },
            watchChange = function(newVal, oldVal) {
              if (newVal !== oldVal) {
                if (timeout) {
                  $timeout.cancel(timeout);
                }
                timeout = $timeout(scope.save, saveDelay);
              }
            };

        scope.save = function(){
          $timeout.cancel(timeout);

          if (!saveInProgress) {
            saveInProgress = true;
            db.recipe.saveNotes(scope.model, saveFinished);
          }
        };

        // watch fields
        scope.$watch('model.ingredients', watchChange);
        scope.$watch('model.procedure', watchChange);
        scope.$watch('model.cooking_time', watchChange);
        scope.$watch('model.materials', watchChange);
      }
    };
}])

.directive('monthlyStats', [
function() {
  return {
    restrict: 'E',
    scope: {
      val: '='
    },
    link: function(scope, element, attrs) {
      var margin = {top: 20, right: 20, bottom: 70, left: 210},
          width = 900 - margin.left - margin.right,
          height = 1000 - margin.top - margin.bottom;

      var x = d3.scale.linear().range([0, width]);

      var y = d3.scale.ordinal().rangeRoundBands([0, height], .05);

      var svg = d3.select(element[0]).append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform", 
                "translate(" + margin.left + "," + margin.top + ")");

      var data = [];
      scope.val.forEach(function(d) {
        data = data.concat(d.recipes);
      });

      x.domain([0, d3.max(data, function(d) { return d.count; })]);
      y.domain(data.map(function(d) { return d.recipe; }));

      // x axis
      var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom");

      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis)
        .selectAll("text")
          .style("text-anchor", "end");

      // y axis
      var yAxis = d3.svg.axis()
          .scale(y)
          .orient("left")
          .ticks(10);

      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis);

      // draw
      svg.selectAll("bar")
          .data(data)
        .enter()
        .append("rect")
          .style("fill", function(d) { 
            var id = d.type._id;
            return "rgb("+(id * 10)+", "+(id * 20)+", " + (id * 40) + ")"; 
          })
          .attr("x", function(d) { return 0; })
          .attr("width", function(d) { return x(d.count); })
          .attr("y", function(d) { return y(d.recipe); })
          .attr("height", y.rangeBand());

        // .append("text")
        //  .text(function(d) {
        //     return d.count;
        //  }).attr("x", function(d, i) {
        //     return x(d.count);
        //     // return i * (w / data.length);
        //  })
        //  .attr("y", function(d) {
        //   console.log(y(d.recipe));
        //     return y(d.recipe);
        //     // return h - (d * 4);
        //  });
    }
  };
}
])

;
