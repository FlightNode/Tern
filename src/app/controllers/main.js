'use strict';

/**
 * @ngdoc function
 * @name flightNodeApp.controller:MainController
 * @description
 * # MainController
 * Controller for the default/main page
 */
angular.module('flightNodeApp')
    .controller('MainController', ['$scope', 'config',
        function($scope, config) {
            $scope.loading = true;
  
            $scope.loading = false;
        }
    ]);
