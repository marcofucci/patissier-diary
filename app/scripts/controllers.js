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
            return test;
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
        size: 'lg',
        resolve: {
          recipe: function() { 
            return recipe;
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

        test.img = newFilePath.replace(process.env.HOME, '$HOME');
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
    $scope.edit = false;

    $scope.changeEdit = function(edit) {
      $scope.edit = edit;
    };

    $scope.close = function () {
      $scope.$dismiss('cancel');
      $state.reload();
    };
  }
])

.controller('MontlyProgressCtrl', ['$scope', 'data', 'dates', 'currentMonth', '$state', function($scope, data, dates, currentMonth, $state){
  $scope.data = data;
  $scope.dates = dates;
  $scope.current_month = currentMonth;

  $scope.$watch('current_month', function(newVal, oldVal) {
    $state.go('monthly_progress', {month: newVal});
  });
}])
;