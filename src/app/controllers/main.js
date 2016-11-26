'use strict';

/**
 * @ngdoc function
 * @name flightNodeApp.controller:MainController
 * @description
 * # MainController
 * Controller for the default/main page
 */
angular.module('flightNodeApp')
    .controller('MainController', ['$scope',
        function($scope) {
            $scope.loading = true;
  
            $scope.loading = false;
        }
    ]);
