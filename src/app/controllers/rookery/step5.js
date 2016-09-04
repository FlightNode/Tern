'use strict';

/**
 * @ngdoc function
 * @name flightNodeApp.controller:RookeryCensusStep5Controller
 * @description
 * # RookeryCensusStep5Controller
 * Controller for rookery census form, step 5.
 */
angular.module('flightNodeApp')
    .controller('RookeryCensusStep5Controller', ['$scope', 'authService', 'config', 'messenger',
        'rookeryCensusProxy', '$filter', '$location', '$log', 'locationProxy', 'enumsProxy',
        '$route', '$uibModal', 'birdsProxy', '$routeParams',
        function($scope, authService, config, messenger,
            rookeryCensusProxy, $filter, $location, $log, locationProxy, enumsProxy,
            $route, $uibModal, birdsProxy, $routeParams) {


            if (!(authService.isReporter())) {
                $log.warn('not authorized to access this path');
                $location.path('/');
                return;
            }


            //
            // Helper functions
            //

            var modelKey = "rookeryCensusModel";
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
                var id = +$scope.rookeryCensus.siteTypeId;
                var siteType = _.find($scope.enums.siteTypeInfo, { id: id });
                if (siteType) {
                    return siteType.description;
                } else {
                    return '';
                }
            };
            var getVantagePoint = function() {
                var id = +$scope.rookeryCensus.vantagePointId;
                var vantagePoint = _.find($scope.enums.vantagePointInfo, { id: id });
                if (vantagePoint) {
                    return vantagePoint.description;
                } else {
                    return '';
                }
            };
            var getAccessPoint = function() {
                var id = +$scope.rookeryCensus.accessPointId;
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

            var getAdultsDisplay = function(value) {
                switch (value) {
                    case "0":
                        return "none";
                    case "1":
                        return "less than 25";
                    case "2":
                        return "25 to 200";
                    case "3":
                        return "more than 200";
                    default:
                        return "invalid";
                }
            };

            var getObservations = function() {
                var o =
                    _.map($scope.rookeryCensus.observations, function(item) {

                        return {
                            birdSpeciesId: item.birdSpeciesId,
                            commonName: $scope.allBirds[item.birdSpeciesId].commonName,
                            adults: getAdultsDisplay(item.numberOfAdults),
                            nestsPresent: item.nestsPresent,
                            chicksPresent: item.chicksPresent,
                            fledglingsPresent: item.fledglingsPresent
                        };

                    });
                return o;
            };

            var getDisturbanceType = function(id) {
                return _.find($scope.enums.disturbanceTypeInfo, { id: +id }).description;
            };

            var getDisturbances = function() {
                var d = _.map($scope.rookeryCensus.disturbances, function(item) {

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
                    surveyDate: $scope.rookeryCensus.startDate,
                    startTime: $scope.rookeryCensus.startTime,
                    endTime: $scope.rookeryCensus.endTime,
                    siteType: getSiteType(),
                    observers: $scope.rookeryCensus.observers,
                    vantagePoint: getVantagePoint(),
                    accessPoint: getAccessPoint(),
                    observations: getObservations(),
                    disturbances: getDisturbances(),
                 };
            };

            var disableFinishButtonIfModelNotFullyValid = function() {
                var f = $scope.rookeryCensus;
                $scope.reviewInvalid = f.siteTypeId === null ||
                    f.observers === null ||
                    f.vantagePointId === null ||
                    f.accessPointId === null;
            };

            //
            // Configure button actions
            //
            $scope.next = function() {

                $scope.loading = true;
                $scope.rookeryCensus.finishedEditing = true;

                rookeryCensusProxy.update($scope, $scope.rookeryCensus, function(data) {

                    saveToSession(null); // clear the session

                    $scope.loading = false;

                    $location.path('/rookery/complete/');
                });
            };


            $scope.back = function() {
                $location.path('/rookery/step4/' + $scope.rookeryCensus.surveyIdentifier);
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
                    $location.path('/rookery/step1');

                }, function dismissed() {
                    // do nothing
                });
            };


            //
            // Main program flow
            //
            $scope.loading = true;

            loadEnums(function() {
                getAllBirds(function() {
                    $scope.rookeryCensus = pullFromSession();
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
