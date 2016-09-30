'use strict';

/**
 * @ngdoc function
 * @name flightNodeApp.controller:UserEditController
 * @description
 * # UserEditController
 * Controller for the edit user page.
 */
angular.module('flightNodeApp')
    .controller('UserEditController', ['$scope', '$log', '$location', 'messenger', 'authService', '$uibModalInstance', 'id', 'roleProxy', 'userProxy',
        function($scope, $log, $location, messenger, authService, $uibModalInstance, id, roleProxy, userProxy) {

            if (!authService.isAdministrator()) {
                $log.warn('not authorized to access this path');
                $location.path('/');
                return;
            }

            $scope.loading = true;
            $scope.showRoles = true;
            $scope.showActiveStatus = true;

            if (!isFinite(id)) {
                // garbage input
                return;
            }


            $scope.data = { roles: roleProxy.getAll() };

            userProxy.findOne($scope, id)();

            $scope.cancel = function() {
                $uibModalInstance.dismiss('cancel');
            };

            $scope.submit = userProxy.update($scope, $uibModalInstance, id);

            $scope.loading = false;
        }
    ]);
