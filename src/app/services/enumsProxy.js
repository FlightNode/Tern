'use strict';

/**
 * @ngdoc function
 * @name flightNodeApp.Services:enumsProxy
 * @description
 * # enumsProxy
 * Proxy service for working with locations
 */
angular.module('flightNodeApp')
    .factory('enumsProxy', ['$http', '$log', 'authService', 'config', 'messenger', '$q',
        function($http, $log, authService, config, messenger, $q) {
            return {
                getForForagingSurvey: function($scope, next) {

                    // This should run the queries in parallel, with the success
                    // and error callbacks only running when all have finished.
                    $q.all([
                        authService.get(config.weather),
                        authService.get(config.waterheights),
                        authService.get(config.disturbancetypes),
                        authService.get(config.habitattypes),
                        authService.get(config.feedingsuccessrates),
                        authService.get(config.activitytypes),
                        authService.get(config.siteassessments),
                        authService.get(config.vantagepoints),
                        authService.get(config.accesspoints)
                    ])
                    .then(function success(responses) {

                        next({
                            weatherInfo: responses[0].data,
                            waterHeights: responses[1].data,
                            disturbanceTypeInfo: responses[2].data,
                            habitatInfo: responses[3].data,
                            feedingRateInfo: responses[4].data,
                            behaviorTypeInfo: responses[5].data,
                            siteTypeInfo: responses[6].data,
                            vantagePointInfo: responses[7].data,
                            accessPointInfo: responses[8].data
                        });

                    }, function error(responses) {
                        _.each(responses, function(response){
                            $log.error(response);
                        });

                        messenger.displayErrorResponse($scope, "Unable to retrieve some or all of the data required for this page.");

                    });
                }
            }
        }
    ]);
