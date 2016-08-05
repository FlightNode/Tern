'use strict';

/**
 * @ngdoc function
 * @name flightNodeApp.Services:birdsProxy
 * @description
 * # birdsProxy
 * Proxy service for working with locations
 */
angular.module('flightNodeApp')
    .factory('birdsProxy', ['$http', '$log', 'authService', 'config', 'messenger', '$q',
        function($http, $log, authService, config, messenger, $q) {
            return {

                getForagingBirds: function($scope, next) {

                    authService.get(config.birdspecies + '?surveyTypeId=2')
                        .then(function success(response) {

                            next(response);
// deferred reject. didn't like that

                        }, function error(response) {

                            messenger.displayErrorResponse($scope, response);

                        });
                }
            }
        }
    ]);
