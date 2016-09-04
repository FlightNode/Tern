'use strict';

/**
 * @ngdoc function
 * @name flightNodeApp.Services:rookeryCensusProxy
 * @description
 * # rookeryCensusProxy
 * Service for supporting the Rookery Census
 */
angular.module('flightNodeApp')
    .factory('rookeryCensusProxy', ['authService', 'config', 'messenger', '$log', '$q',
        function(authService, config, messenger, $log, $q) {
            return {
                getById: function($scope, id, next) {

                    authService.get(config.rookeryCensus + id)
                        .then(function success(response) {

                            next(response.data);

                        }, function error(response) {

                            messenger.displayErrorResponse($scope, response);

                        });
                },

                getByUserId: function($scope, id, next) {

                    authService.get(config.rookeryCensus + "?userId" + userId)
                        .then(function success(response) {

                            next(response.data);

                        }, function error(response) {

                            messenger.displayErrorResponse($scope, response);

                        });
                },

                create: function($scope, model, next) {

                    authService.post(config.rookeryCensus, model)
                        .then(function success(response) {

                            next(response.data);

                        }, function error(response) {

                            messenger.displayErrorResponse($scope, response);

                        });
                },

                update: function($scope, model, next) {
                    var id = model.surveyIdentifier;
                    authService.put(config.rookeryCensus + id, model)
                        .then(function success(response) {

                            next(response.data);

                        }, function error(response) {

                            messenger.displayErrorResponse($scope, response);

                        });
                },

                getFullList: function($scope, next) {

                    authService.get(config.rookeryCensus)
                        .then(function success(response) {

                            next(response.data);

                        }, function error(response) {

                            messenger.displayErrorResponse($scope, response);

                        });
                },

                export: function($scope) {
                    var deferred = $q.defer();

                    authService.get(config.rookeryCensusExport)
                        .then(function success(response) {
                            deferred.resolve(response.data);
                        }, function error(response) {
                            messenger.displayErrorResponse($scope, response);
                        });

                    return deferred.promise;
                }
            }
        }
    ]);
