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
      		var deferred = $q.defer(),
              groupedRecipes = [];

          db.subtype.getAllByTypeId($stateParams.typeId, function(err, subtypes) {
            angular.forEach(subtypes, function(subtype, index) {
              db.recipe.getAllBySubTypeId(subtype._id, function(err, recipes) {
                groupedRecipes.push({
                  'group': subtype.name,
                  'recipes': recipes
                });
              });

            });

        		db.recipe.getAllByTypeId($stateParams.typeId, true, function(err, recipes) {
              if (recipes.length) {
                groupedRecipes.push({
                  'group': groupedRecipes.length ? 'Other' : '',
                  'recipes': recipes
                });
              }

              angular.forEach(groupedRecipes, function(data, i) {
                angular.forEach(data.recipes, function(recipe, j) {
                  db.recipe.getStats(recipe._id, function(err, count, lastTest, avRating) {
                    recipe.stats = {
                      count: count,
                      lastTest: lastTest,
                      avRating: avRating
                    }
                  })
                })
              });

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

		return defs;
	};

})();