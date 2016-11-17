'use strict';

/**
 * @ngdoc function
 * @name flightNodeApp.Services:birdsProxy
 * @description
 * # birdsProxy
 * Proxy service for working with locations
 */
angular.module('flightNodeApp')
    .factory('birdsProxy', ['$http', '$log', 'authService', 'config', 'messenger',
        function($http, $log, authService, config, messenger) {
            return {

                getForagingBirds: function($scope, next) {

                    authService.get(config.birdspecies + '?surveyTypeId=2')
                        .then(function success(response) {

                            next(response.data);

                        }, function error(response) {

                            messenger.displayErrorResponse($scope, response);

                        });
                },


                getRookeryBirds: function($scope, next) {

                    authService.get(config.birdspecies + '?surveyTypeId=1')
                        .then(function success(response) {

                            next(response.data);

                        }, function error(response) {

                            messenger.displayErrorResponse($scope, response);

                        });
                },

                getAll: function($scope, next) {
                    authService.get(config.birdspecies)
                        .then(function success(response) {

                            next(response.data);

                        }, function error(response) {

                            messenger.displayErrorResponse($scope, response);

                        });
                },

                get: function($scope, id, next) {
                    var url = config.birdspecies + id;
                    authService.get(url)
                        .then(function success(response) {
                            next(response.data);

                        }, function error(response) {
                            messenger.displayErrorResponse($scope, response);
                        });

                }

            };
        }
    ]);
