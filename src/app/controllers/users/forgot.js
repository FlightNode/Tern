'use strict';

/**
 * @ngdoc function
 * @name flightNodeApp.controller:UserForgotPasswordController
 * @description
 * # UserForgotPasswordController
 * Controller for the forgotten password page.
 */
angular.module('flightNodeApp')
    .controller('UserForgotPasswordController', ['$scope', '$log', 'messenger', 'authService', 'userProxy',
        function($scope, $log, messenger, authService, userProxy) {

            $scope.loading = true;

            $scope.submitted = false;

            $scope.submit = function() {
                $scope.loading = true;

                var success = "Password reset has been initiatied - look for an e-mail.";
                userProxy.initiateReset($scope, $scope.emailAddress, success, function() {
                    $scope.loading = false;
                })
            };


            $scope.loading = false;
        }
    ]);
