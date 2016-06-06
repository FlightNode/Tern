'use strict';

/**
 * @ngdoc function
 * @name flightNodeApp.Services:foragingSurveyProxy
 * @description
 * # foragingSurveyProxy
 * Service for supporting the Waterbird Foraging Survey
 */
angular.module('flightNodeApp')
    .factory('foragingSurveyProxy', ['authService', 'config', 'messenger', '$log',
        function(authService, config, messenger, $log) {
            return {
                getById: function($scope, id, next) {

                    authService.get(config.waterbirdForagingSurvey + id)
                        .then(function success(response){

                            next(response.data);

                        }, function error(response) {

                            $log.error('Foraging survey getById: ', response);
                            messenger.showErrorMessage($scope, response.data)
                            
                        });
                },

                getByUserId: function($scope, id, next) {

                    authService.get(config.waterbirdForagingSurvey + "?userId" + userId)
                        .then(function success(response){

                            next(response.data);

                        }, function error(response) {

                            $log.error('Foraging survey getByUserId: ', response);
                            messenger.showErrorMessage($scope, response.data)
                            
                        });
                },

                create: function($scope, model, next) {

                    authService.post(config.waterbirdForagingSurvey, model)
                        .then(function success(response){

                            next(response.data);

                        }, function error(response) {

                            $log.error('Foraging survey create: ', response);
                            messenger.showErrorMessage($scope, response.data)
                            
                        });
                },

                update: function($scope, model, next) {
                    var id = model.surveyIdentifier;
                    authService.put(config.waterbirdForagingSurvey + id, model)
                        .then(function success(response){

                            next(response.data);

                        }, function error(response) {

                            messenger.showErrorMessage($scope, response)
                            
                        });
                }
            }
        }
    ]);
