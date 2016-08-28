'use strict';

/**
 * @ngdoc function
 * @name flightNodeApp.controller:ForagingStep5Controller
 * @description
 * # ForagingStep5Controller
 * Controller for rookery foraging census form, step 5.
 */
angular.module('flightNodeApp')
    .controller('ForagingStep5Controller', ['$scope', 'authService', 'config', 'messenger',
        'foragingSurveyProxy', '$filter', '$location', '$log', 'locationProxy', 'enumsProxy',
        '$route', '$uibModal', 'birdsProxy', '$routeParams',
        function($scope, authService, config, messenger,
            foragingSurveyProxy, $filter, $location, $log, locationProxy, enumsProxy,
            $route, $uibModal, birdsProxy, $routeParams) {


            if (!(authService.isReporter())) {
                $log.warn('not authorized to access this path');
                $location.path('/');
                return;
            }


            //
            // Helper functions
            //

            var modelKey = "foragingSurveyModel";
            var locationNameKey = "locationName";

            var saveToSession = function(data, key) {
                key = key || modelKey;
                sessionStorage.setItem(key, JSON.stringify(data));
            };

            var pullFromSession = function(key) {
                key = key || modelKey;
                var stored = sessionStorage.getItem(key);
                stored = stored === "undefined" ? undefined : stored;
                if (stored) {
                    return JSON.parse(stored || {});
                }
                return null;
            };

            var getAllBirds = function(next) {
                birdsProxy.getAll($scope, function(data) {
                    $scope.allBirds = _(data)
                        .map(function(item) {
                            return {
                                commonName: item.commonName,
                                commonAlphaCode: item.commonAlphaCode,
                                id: item.id
                            };
                        })
                        .keyBy(function(b) {
                            return b.id
                        })
                        .value();

                    next();
                });
            };

            var loadEnums = function(next) {
                // TODO: look into caching this cleanly
                if (!$scope.enums) {
                    enumsProxy.getForForagingSurvey($scope, function(data) {
                        $scope.enums = data;
                        next();
                    });
                }
            };


            var getSiteType = function() {
                var id = +$scope.foragingSurvey.siteTypeId;
                var siteType = _.find($scope.enums.siteTypeInfo, { id: id });
                if (siteType) {
                    return siteType.description;
                } else {
                    return '';
                }
            };
            var getTide = function() {
                var id = +$scope.foragingSurvey.tideId;
                var tide = _.find($scope.enums.tideInfo, { id: id });
                if (tide) {
                    return tide.description;
                } else {
                    return '';
                }
            };
            var getWeather = function() {
                var id = +$scope.foragingSurvey.weatherId;
                var weather = _.find($scope.enums.weatherInfo, { id: id });
                if (weather) {
                    return weather.description;
                } else {
                    return '';
                }
            };
            var getVantagePoint = function() {
                var id = +$scope.foragingSurvey.vantagePointId;
                var vantagePoint = _.find($scope.enums.vantagePointInfo, { id: id });
                if (vantagePoint) {
                    return vantagePoint.description;
                } else {
                    return '';
                }
            };
            var getAccessPoint = function() {
                var id = +$scope.foragingSurvey.accessPointId;
                var accessPoint = _.find($scope.enums.accessPointInfo, { id: id });
                if (accessPoint) {
                    return accessPoint.description;
                } else {
                    return '';
                }
            };
            var getCommonName = function(id) {
                return _.find($scope.birdSpeciesList, { id: id }).commonName;
            };
            var getActivity = function(id) {
                return _.find($scope.enums.behaviorTypeInfo, { id: +id }).description;
            };
            var getHabitat = function(id) {
                return _.find($scope.enums.habitatInfo, { id: +id }).description;
            };
            var getFeeding = function(id) {
                return _.find($scope.enums.feedingRateInfo, { id: +id }).description;
            };

            var getObservations = function() {
                var o =
                    _.map($scope.foragingSurvey.observations, function(item) {

                        return {
                            birdSpeciesId: item.birdSpeciesId,
                            commonName: $scope.allBirds[item.birdSpeciesId].commonName,
                            adults: item.adults,
                            juveniles: item.juveniles,
                            primaryActivity: (item.primaryActivityId) ? getActivity(item.primaryActivityId) : 'invalid',
                            secondaryActivity: (item.secondaryActivityId) ? getActivity(item.secondaryActivityId) : 'invalid',
                            habitat: (item.habitatId) ? getHabitat(item.habitatId) : 'invalid',
                            feeding: (item.feedingId) ? getFeeding(item.feedingId) : 'invalid'
                        };

                    });
                return o;
            };

            var getDisturbanceType = function(id) {
                return _.find($scope.enums.disturbanceTypeInfo, { id: +id }).description;
            };

            var getDisturbances = function() {
                var d = _.map($scope.foragingSurvey.disturbances, function(item) {

                    return {
                        disturbanceId: item.disturbanceId,
                        disturbanceType: getDisturbanceType(item.disturbanceTypeId),
                        quantity: item.quantity,
                        durationMinutes: item.durationMinutes,
                        behavior: item.behavior
                    };

                });
                return d;
            };

            var prepareReviewModelForViewBinding = function() {
                $scope.review = {
                    location: pullFromSession(locationNameKey).locationName,
                    surveyDate: $scope.foragingSurvey.startDate,
                    startTime: $scope.foragingSurvey.startTime,
                    endTime: $scope.foragingSurvey.endTime,
                    siteType: getSiteType(),
                    temperature: $scope.foragingSurvey.temperature,
                    windSpeed: $scope.foragingSurvey.windSpeed,
                    weather: getWeather(),
                    observers: $scope.foragingSurvey.observers,
                    vantagePoint: getVantagePoint(),
                    accessPoint: getAccessPoint(),
                    observations: getObservations(),
                    disturbances: getDisturbances(),
                    tide: getTide()
                };
            };

            var disableFinishButtonIfModelNotFullyValid = function() {
                var f = $scope.foragingSurvey;
                $scope.reviewInvalid = f.siteTypeId === null ||
                    f.temperature === null ||
                    f.windSpeed === null ||
                    f.tide === null ||
                    f.weather === null ||
                    f.observers === null ||
                    f.vantagePointId === null ||
                    f.accessPointId === null;
            };

            //
            // Configure button actions
            //
            $scope.next = function() {

                $scope.loading = true;
                $scope.foragingSurvey.finished = true;

                foragingSurveyProxy.update($scope, $scope.foragingSurvey, function(data) {

                    saveToSession(null); // clear the session

                    $scope.loading = false;

                    $location.path('/foraging/complete/');
                });
            };


            $scope.back = function() {
                $location.path('/foraging/step4/' + $scope.foragingSurvey.surveyIdentifier);
            };

            $scope.reset = function() {
                var modal = $uibModal.open({
                    animation: true,
                    templateUrl: '/app/views/confirmResetForm.html',
                    backdrop: true,
                    size: 'sm'
                });
                modal.result.then(function success() {

                    saveToSession(null);

                    // Reload the first page
                    $location.path('/foraging/step1');

                }, function dismissed() {
                    // do nothing
                });
            };


            //
            // Main program flow
            //
            $scope.loading = true;

            // TODO: better method chaining
            loadEnums(function() {
                getAllBirds(function() {
                    $scope.foragingSurvey = pullFromSession();
                    prepareReviewModelForViewBinding();
                    disableFinishButtonIfModelNotFullyValid();
                })
            });

            $scope.step = 5;

            // Configure shared "bottomBar" components
            $scope.canGoBack = true;
            $scope.canSaveForLater = false;


            $scope.loading = false;
        }
    ]);
