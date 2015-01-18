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
              groupedRecipes = [],
              groupsCount = 0;

          var postProcess = function() {
            db.recipe.getAllByTypeId($stateParams.typeId, true, function(err, recipes) {
              if (recipes.length) {
                groupsCount += 1;
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

                    if (i == groupsCount-1 && j == data.recipes.length-1) {
                      deferred.resolve(groupedRecipes);
                    }
                  })
                })
              });
            });
          }

          db.subtype.getAllByTypeId($stateParams.typeId, function(err, subtypes) {
            if (!subtypes.length) {
              postProcess();
            } else {
              angular.forEach(subtypes, function(subtype, index) {
                db.recipe.getAllBySubTypeId(subtype._id, function(err, recipes) {
                  groupsCount += 1;
                  groupedRecipes.push({
                    'group': subtype.name,
                    'recipes': recipes
                  });

                  if (index == subtypes.length-1) {
                    postProcess();
                  }
                });

              });
            }
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
          var deferred = $q.defer(),
              _data = [];

          angular.forEach(types, function(type, i) {
            if (!type.component) {
              var typeData = {
                type: type,
                recipes: []
              };

              db.recipe.getAllByTypeId(type._id, false, function(err, recipes) {
                angular.forEach(recipes, function(recipe, j) {
                  db.recipe.getCountPerMonth(recipe._id, currentMonth, function(err, count) {
                    typeData.recipes.push({
                      type: type,
                      recipe: recipe.name,
                      count: count
                    });

                    if (j == recipes.length-1) {
                      deferred.resolve(_data);
                    }
                  });
                });
              });

              _data.push(typeData);
            }
          });

          return deferred.promise;
        }]
      }
    };

    return defs;
  };



})();