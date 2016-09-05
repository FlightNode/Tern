'use strict';

/**
 * @ngdoc function
 * @name flightNodeApp.controller:UserChangePasswordController
 * @description
 * # UserChangePasswordController
 * Controller for the change password page.
 */
angular.module('flightNodeApp')
    .controller('UserChangePasswordController', 
        ['$scope', '$log', 'messenger', 'authService', 'userProxy', '$location',
        function($scope, $log, messenger, authService, userProxy, $location) {

            $scope.loading = true;

            $scope.submitted = false;

            // If token isn't provided, just let the server respond appropriately. Lazy but effective
            var token = encodeURIComponent($location.search().token || '');

            $scope.submit = function() {
                $scope.loading = true;

                var success = "Password has been changed.";
                userProxy.changePassword($scope, token, $scope.emailAddress, $scope.password, success, function() {
                    $scope.loading = false;
                })
            };

            $scope.checkPasswordMatching = function() {
                $scope.notMatching = $scope.password !== $scope.password2;
            }


            $scope.loading = false;
        }
    ]);
