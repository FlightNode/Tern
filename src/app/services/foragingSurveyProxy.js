'use strict';

/**
 * @ngdoc function
 * @name flightNodeApp.Services:foragingSurveyProxy
 * @description
 * # foragingSurveyProxy
 * Service for supporting the Waterbird Foraging Survey
 */
angular.module('flightNodeApp')
    .factory('foragingSurveyProxy', ['authService', 'config', 'messenger', '$log', '$q',
        function(authService, config, messenger, $log, $q) {
            return {
                getById: function($scope, id, next) {

                    authService.get(config.waterbirdForagingSurvey + id)
                        .then(function success(response){

                            next(response.data);

                        }, function error(response) {

                            messenger.displayErrorResponse($scope, response);
                            
                        });
                },

                getByUserId: function($scope, id, next) {

                    authService.get(config.waterbirdForagingSurvey + "?userId" + userId)
                        .then(function success(response){

                            next(response.data);

                        }, function error(response) {

                            messenger.displayErrorResponse($scope, response);
                            
                        });
                },

                create: function($scope, model, next) {

                    authService.post(config.waterbirdForagingSurvey, model)
                        .then(function success(response){

                            next(response.data);

                        }, function error(response) {

                            messenger.displayErrorResponse($scope, response);
                            
                        });
                },

                update: function($scope, model, next) {
                    var id = model.surveyIdentifier;
                    authService.put(config.waterbirdForagingSurvey + id, model)
                        .then(function success(response){

                            next(response.data);

                        }, function error(response) {

                            messenger.displayErrorResponse($scope, response);
                            
                        });
                },

                getFullList: function($scope, next) {

                    authService.get(config.waterbirdForagingSurvey)
                        .then(function success(response){

                            next(response.data);

                        }, function error(response) {

                            messenger.displayErrorResponse($scope, response);
                            
                        });
                },

                export: function($scope) {
                    var deferred = $q.defer();

                    authService.get(config.foragingExport)
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
