'use strict';

/**
 * @ngdoc function
 * @name flightNodeApp.Services:locationProxy
 * @description
 * # locationProxy
 * Proxy service for working with locations
 */
angular.module('flightNodeApp')
    .factory('locationProxy', ['$http', '$log', 'authService', 'config', 'messenger',
        function($http, $log, authService, config, messenger) {
            return {
                get: function($scope, next) {

                    authService.get(config.locations)
                        .then(function success(response) {

                            next(response.data);

                        }, function error(response) {

                            messenger.displayErrorResponse($scope, response);

                        });
                }
            }
        }
    ]);
