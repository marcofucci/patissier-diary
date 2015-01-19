'use strict';
(function() {
	var states = angular.module('app.states', []);

	states.getStates = function() {
		var defs = {};

    defs.Layout = {
      name: 'layout',
      abstract: true,
      resolve: {
	      types: ['db', '$q', function(db, $q) {
	      	var deferred = $q.defer();

			    db.type.getAll(function(err, types) {
			    	deferred.resolve(types);
			    });

			    return deferred.promise;
	      }]
	    },
      views: {
        '@': {
          templateUrl: '/partials/base.html'
        },
        'nav@layout': {
          templateUrl: '/partials/nav.html',
          controller: 'LayoutCtrl'
        }
      }
    };

    defs.Dashboard = {
      name: 'dashboard',
      parent: 'layout',
      url: '#dashboard',
      templateUrl: '/partials/dashboard.html'
    };

    defs.TypeDetail = {
      name: 'type_detail',
      parent: 'layout',
      url: '#type={typeId}',
      templateUrl: '/partials/type_detail.html',
      controller: 'TypeDetailCtrl',
      resolve: {
      	type: ['$stateParams', '$q', 'db', function($stateParams, $q, db) {
      		var deferred = $q.defer();

      		db.type.getById($stateParams.typeId, function(err, type) {
      			deferred.resolve(type);
      		});
      		return deferred.promise;
      	}],

      	recipes: ['$stateParams', '$q', 'db', function($stateParams, $q, db) {
      		var deferred = $q.defer();
          var wait = require('wait.for');

          wait.launchFiber(function() {
            var groupedRecipes = [];
            var subtypes =  wait.for(db.subtype.getAllByTypeId, $stateParams.typeId);

            angular.forEach(subtypes, function(subtype, index) {
              var recipes = wait.for(db.recipe.getAllBySubTypeId, subtype._id);
              if (recipes.length) {
                groupedRecipes.push({
                  'group': subtype.name,
                  'recipes': recipes
                });
              }
            });

            var recipes = wait.for(db.recipe.getAllByTypeId, $stateParams.typeId, true);
            if (recipes.length) {
              groupedRecipes.push({
                'group': groupedRecipes.length ? 'Other' : '',
                'recipes': recipes
              });
            }

            angular.forEach(groupedRecipes, function(data, i) {
              angular.forEach(data.recipes, function(recipe, j) {
                var results = wait.for(db.recipe.getStats, recipe._id);
                recipe.stats = {
                  count: results.count,
                  lastTest: results.lastTest,
                  avRating: results.avRating
                }
              })
              deferred.resolve(groupedRecipes);
            });
          });

      		return deferred.promise;
      	}]
      }
    };

    defs.RecipeDetail = {
      name: 'recipe_detail',
      parent: 'layout',
      controller: 'RecipeDetailCtrl',
      url: '#type={typeId}&recipe={recipeId}',
      templateUrl: '/partials/recipe_detail.html',
      resolve: {
        type: ['$stateParams', '$q', 'db', function($stateParams, $q, db) {
          var deferred = $q.defer();

          db.type.getById($stateParams.typeId, function(err, type) {
            deferred.resolve(type);
          });
          return deferred.promise;
        }],

      	recipe: ['$stateParams', '$q', 'db', function($stateParams, $q, db) {
      		var deferred = $q.defer();

      		db.recipe.getById($stateParams.recipeId, function(err, recipe) {
      			deferred.resolve(recipe);
      		});
      		return deferred.promise;
      	}],

      	tests: ['$stateParams', '$q', 'db', function($stateParams, $q, db) {
      		var deferred = $q.defer();

      		db.test.getAllByRecipeId($stateParams.recipeId, function(err, tests) {
      			deferred.resolve(tests);
      		});
      		return deferred.promise;
      	}]
      }
    };

    defs.MonthlyProgress = {
      name: 'monthly_progress',
      parent: 'layout',
      controller: 'MontlyProgressCtrl',
      url: '#monthly_progress&month={month}',
      templateUrl: '/partials/monthly_progress.html',
      resolve: {
        dates: ['$q', 'db', function($q, db) {
          var deferred = $q.defer();

          db.test.getAllMonths(function(err, docs) {
            deferred.resolve(docs);
          });

          return deferred.promise;
        }],
        currentMonth: ['$stateParams', function($stateParams) {
          return $stateParams.month;
        }],
        data: ['$q', 'db', 'types', 'currentMonth', function($q, db, types, currentMonth) {
          var deferred = $q.defer();
          var wait = require('wait.for');

          wait.launchFiber(function() {
            var _data = [];

            angular.forEach(types, function(type, i) {
              if (!type.component) {
                var typeData = {
                  type: type,
                  recipes: []
                };

                var recipes = wait.for(db.recipe.getAllByTypeId, type._id, false);
                angular.forEach(recipes, function(recipe, j) {
                  var count = wait.for(db.recipe.getCountPerMonth, recipe._id, currentMonth);
                  typeData.recipes.push({
                    type: type,
                    recipe: recipe.name,
                    count: count
                  });

                });

                _data.push(typeData);
              }
            });

            deferred.resolve(_data);
          });

          return deferred.promise;
        }]
      }
    };

    return defs;
  };



})();