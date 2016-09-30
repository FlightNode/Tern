'use strict';

flnd.locationCreate = {
    configureSubmit: function($scope, config, messenger, authService, $uibModalInstance) {
        return function() {
            $scope.loading = true;

            authService.post(config.locations, $scope.location)
                .then(function success() {

                    $uibModalInstance.close();

                }, function error(response) {

                    messenger.displayErrorResponse($scope, response);

                })
                .finally(function() {
                    $scope.loading = false;
                });
        };
    }
};

/**
 * @ngdoc function
 * @name flightNodeApp.controller.location:LocationCreateController
 * @description
 * # LocationCreateController
 * Controller for the create work type page.
 */
angular.module('flightNodeApp')
    .controller('LocationCreateController', ['$scope', '$http', '$log', '$location', 'messenger', 'authService', 'config', '$uibModalInstance',
        function($scope, $http, $log, $location, messenger, authService, config, $uibModalInstance) {


            if (!authService.isAdministrator()) {
                $log.warn('not authorized to access this path');
                $location.path('/');
                return;
            }

            $scope.loading = true;

            $scope.cancel = function() {
                $uibModalInstance.dismiss('cancel');
            };

            $scope.submit = flnd.locationCreate.configureSubmit($scope, config, messenger, authService, $uibModalInstance);

            $scope.loading = false;
        }
    ]);
