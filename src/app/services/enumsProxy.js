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
                        authService.get(config.tides),
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
                            waterheights: responses[1].data,
                            tideInfo: responses[2].data,
                            disturbanceTypeInfo: responses[3].data,
                            habitatInfo: responses[4].data,
                            feedingRateInfo: responses[5].data,
                            behaviorTypeInfo: responses[6].data,
                            siteTypeInfo: responses[7].data,
                            vantagePointInfo: responses[8].data,
                            accessPointInfo: responses[9].data
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
