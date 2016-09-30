'use strict';

flnd.workTypeCreate = {
    configureSubmit: function(config, $scope, messenger, authService, $uibModalInstance) {
        return function() {
            $scope.loading = true;

            authService.post(config.workTypes, $scope.worktype)
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
 * @name flightNodeApp.controller.worktype:WorktypeCreateController
 * @description
 * # WorktypeCreateController
 * Controller for the create work type page.
 */
angular.module('flightNodeApp')
    .controller('WorktypeCreateController', ['$scope', '$http', '$log', '$location', 'messenger', 'authService', 'config', '$uibModalInstance',
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

            $scope.submit = flnd.workTypeCreate.configureSubmit(config, $scope, messenger, authService, $uibModalInstance);

            $scope.loading = false;
        }
    ]);
