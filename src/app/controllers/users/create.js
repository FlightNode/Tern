'use strict';

/**
 * @ngdoc function
 * @name flightNodeApp.controller:UserCreateController
 * @description
 * # UserCreateController
 * Controller for the create user page.
 */
angular.module('flightNodeApp')
    .controller('UserCreateController', ['$scope', '$log', 'messenger', 'roleProxy', 'authService', '$uibModalInstance', 'userProxy',
        function($scope, $log, messenger, roleProxy, authService, $uibModalInstance, userProxy) {



            if (!authService.isAdministrator()) {
                $log.warn('not authorized to access this path');
                $uibModalInstance.dismiss('cancel');
                return;
            }

            $scope.loading = true;
            $scope.data = {};
            $scope.showRoles = true;


            $scope.data.roles = roleProxy.getAll();

            $scope.cancel = function() {
                $uibModalInstance.dismiss('cancel');
            };

            $scope.submit = userProxy.insert($scope, $uibModalInstance);

            $scope.loading = false;
        }
    ]);
