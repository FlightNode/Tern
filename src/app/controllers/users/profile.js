'use strict';

/**
 * @ngdoc function
 * @name flightNodeApp.controller:UserProfileController
 * @description
 * # UserProfileController
 * Controller for the create user page.
 */
angular.module('flightNodeApp')
    .controller('UserProfileController', ['$scope', '$log', 'messenger', 'roleProxy', 'authService', 'userProxy', '$location',
        function($scope, $log, messenger, roleProxy, authService, userProxy, $location) {

            if (authService.isAnonymous()) {
                $location.path('/login');
            }

            $scope.loading = true;
            $scope.data = {};
            $scope.showRoles = false;

            var id = authService.getUserId();

            userProxy.getProfile($scope);

            roleProxy.getAll(function(error, response) {
                if (error) {
                    $log.error('Failed to retrieve roles: ', JSON.stringify(error));
                } else {
                    if (response.status === 200) {
                        $scope.data.roles = response.data;
                    } else {
                        messenger.showErrorMessage($scope, 'Unable to load available roles. Please try reloading this page or returning again soon. We apologize for the inconvenience.');
                        $log.info('Roles: ', response);
                    }
                }
            });

            $scope.checkPasswordMatching = function() {
                $scope.passwordsDontMatch = $scope.user.password !== $scope.user.password2;
                $scope.invalid = $scope.user.password && $scope.passwordsDontMatch;
            };

            $scope.cancel = function() {
                $location.path('/');
            };

            $scope.submit = userProxy.putProfile($scope, id);

            $scope.invalid = false;

            $scope.loading = false;
        }
    ]);
