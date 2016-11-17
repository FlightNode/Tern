'use strict';

/**
 * @ngdoc function
 * @name flightNodeApp.controller:ContactController
 * @description
 * # ContactController
 * Controller for the contact form
 */
angular.module('flightNodeApp')
    .controller('ContactController', ['$scope', '$http', '$log', 'messenger', '$location', 'authService', 'config',
        function($scope, $http, $log, messenger, $location, authService, config) {


            $scope.loading = true;

            $scope.reasons = [
                'Problem using the TERN data collection web site'
            ];

            $scope.submit = function() {

                var model = {
                    subject: $scope.message.reason,
                    fromName: $scope.message.fromName,
                    fromAddress: $scope.message.fromEmail,
                    body: $scope.message.message
                };

                var url = config.contact;

                authService.post(url, model)
                    .then(function success() {
                        messenger.showSuccessMessage($scope, 'Your message has been sent.');
                    }, function error(response) {
                        messenger.displayErrorResponse($scope, 'There was an error while trying to send your message. Please try again after a short wait.');
                        $log.error(response);
                    });

            };


            $scope.loading = false;

        }
    ]);
