'use strict'

// Controllers //

angular.module('app.controllers', [])

.controller('LayoutCtrl', [
  '$scope', 'types',
  function($scope, types) {
    $scope.types = types;
  }
])

.controller('TypeDetailCtrl', [
  '$scope', 'type', 'recipes',
  function($scope, type, recipes) {
    $scope.$parent.current_type = type;
    $scope.recipes = recipes;
  }
])

.controller('RecipeDetailCtrl', [
  '$scope', 'type', 'recipe', 'tests', '$modal', '$sce',
  function($scope, type, recipe, tests, $modal, $sce) {
    $scope.$parent.current_type = type;
    $scope.recipe = recipe;
    $scope.tests = tests;

    function openModal(test) {
      $modal.open({
        templateUrl: '/partials/test_modal.html',
        controller: 'TestModalCtrl',
        resolve: {
          'recipe': function() { return recipe; },
          'test': function() {
            var testEdit = {};
            angular.copy(test, testEdit);
            return testEdit;
          }
        }
      });
    }

    $scope.addTest = function() {
      openModal({
        recipe: recipe._id
      });
    };

    $scope.changeTest = function(test) {
      openModal(test);
    };

    $scope.renderHtml = function(htmlCode) {
      return $sce.trustAsHtml(htmlCode.replace(/\n/g, '<br/>'));
    };

    $scope.openImage = function(img) {
      $modal.open({
        templateUrl: '/partials/img_modal.html',
        controller: ['$scope', 'img', function($scope, img) {
          $scope.img = img;

          $scope.cancel = function () {
            $scope.$dismiss('cancel');
          };
        }],
        resolve: {
          'img': function() {
            return img;
          }
        }
      });
    }

    $scope.openRecipeNotes = function() {
      $modal.open({
        templateUrl: '/partials/recipe_notes_modal.html',
        controller: 'RecipeNotesModalCtrl',
        backdrop: 'static',
        resolve: {
          recipe: function() { 
            var recipeEdit = {};
            return angular.copy(recipe, recipeEdit);
          }
        }
      });
    }
  }
])

.controller('TestModalCtrl', [
  '$scope', 'recipe', 'test', 'db', '$state',
  function($scope, recipe, test, db, $state) {
    $scope.recipe = recipe;
    $scope.add = test._id === undefined;
    $scope.test = test;
    $scope.activeTab = 'general';

    $scope.changeTab = function(tab) {
      $scope.activeTab = tab;
    };

    var dismissAndRefresh = function() {
      $scope.cancel();
      $state.reload();
    };

    $scope.cancel = function () {
      $scope.$dismiss('cancel');
    };

    $scope.save = function () {
      // save file
      if (test.temp_img) {
        var fs = require('fs'),
            path = require('path'),
            ext = path.extname(test.temp_img),
            randName = require('crypto').randomBytes(64).toString('hex'),
            newFilePath = path.join(Constants.IMG_PATH, randName+ext);

        fs.createReadStream(test.temp_img).pipe(
          fs.createWriteStream(newFilePath)
        );

        test.img = newFilePath;
        delete test.temp_img;
      }

      // seve in db
      db.test.saveOrUpdate($scope.test, dismissAndRefresh);
    };

    $scope.delete = function() {
      db.test.delete($scope.test, dismissAndRefresh);
    };

    $scope.opened = false;
    $scope.openCalendar = function($event) {
      $event.preventDefault();
      $event.stopPropagation();

      $scope.opened = true;
    };
  }
])

.controller('RecipeNotesModalCtrl', [
  '$scope', 'recipe', 'db', '$state',
  function($scope, recipe, db, $state) {
    $scope.recipe = recipe;
    $scope.new_recipe = {};
    $scope.edit = false;

    $scope.changeEdit = function(edit) {
      $scope.edit = edit;

      if (edit) {
        angular.copy($scope.recipe, $scope.new_recipe);
      }
    };

    var dismissAndRefresh = function() {
      $scope.close();
      $state.reload();
    };

    $scope.close = function () {
      $scope.$dismiss('cancel');
    };

    $scope.cancel = function() {
      $scope.edit = false;
    };

    $scope.save = function () {
      db.recipe.saveNotes(recipe, function() {});
      $scope.recipe = $scope.new_recipe;
      $scope.edit = false;
    };
  }
]);