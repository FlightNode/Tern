'use strict';

/**
 * @ngdoc function
 * @name flightNodeApp.controller:RookeryCensusStep1Controller
 * @description
 * # RookeryCensusStep1Controller
 * Controller for rookery foraging census form, step 1: Location, Date, and Time.
 */
angular.module('flightNodeApp')
    .controller('RookeryCensusStep1Controller', ['$scope', 'authService', 'config', 'messenger',
        'rookeryCensusProxy', '$filter', '$location', '$log', 'locationProxy', 'enumsProxy',
        '$route', '$uibModal', 'birdsProxy', '$routeParams', 'NgMap',
        function($scope, authService, config, messenger,
            rookeryCensusProxy, $filter, $location, $log, locationProxy, enumsProxy,
            $route, $uibModal, birdsProxy, $routeParams, NgMap) {


            if (!(authService.isAuthorized())) {
                $log.warn('not authorized to access this path');
                $location.path('/');
                return;
            }

            //
            // Helper functions
            //

            var modelKey = 'rookeryCensusModel';
            var locationNameKey = 'locationName';

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

            var setupDateAndTimeControls = function() {

                $scope.hstep = 1;
                $scope.mstep = 1;
            };

            var prepareDateAndTimeForUi = function(model) {
                // need to convert to a a real Date object to support timepicker
                var format = 'MM/DD/YYYY hh:mm a';
                if (model.startTime && model.startTime.includes('M')) {
                    model.startTime = moment(model.startDate + ' ' + model.startTime, format).toDate();
                }
                if (model.endTime && model.endTime.includes('M')) {
                    model.endTime = moment(model.startDate + ' ' + model.endTime, format).toDate();
                }


                $scope.startDateObject = model.startTime;
            };

            var configureMapping = function() {
                NgMap.getMap().then(function(map) {
                    $scope.map = map;
                });

                $scope.showLocation = function(evt, index) {
                    $scope.site = $scope.mappableLocations[index];
                    $scope.index = index;
                    $scope.map.showInfoWindow('info', this);
                };

                $scope.useThisSite = function(index) {
                    $scope.rookeryCensus.locationId = $scope.mappableLocations[index].id;
                };
            };


            var loadLocations = function() {
                locationProxy.get($scope, function(data) {
                    // For dropdown
                    $scope.locations = _.map(data, function(location) {
                        return {
                            id: location.id,
                            value: location.siteName + ' - ' + location.siteCode + ' - (' + location.latitude + ', ' + location.longitude + ')'
                        };
                    });
                    // For map
                    $scope.mappableLocations = _.chain(data).map(function(location) {
                        return {
                            position: [location.latitude, location.longitude],
                            name: location.siteName,
                            siteCode: location.siteCode,
                            city: location.city,
                            county: location.county,
                            id: location.id
                        };
                    }).value();
                });
            };

            var storeSelectedLocationNameInSession = function() {
                var location = _.keyBy($scope.locations, function(l) {
                    return l.id;
                })[$scope.rookeryCensus.locationId];
                var locationName = location.value;

                saveToSession({ locationName: locationName }, locationNameKey);
            };

            var loadExistingSurvey = function(id) {
                $scope.loading = true;

                var prepareScope = function(data) {
                    prepareDateAndTimeForUi(data);
                    $scope.rookeryCensus = data;

                    $scope.checkValidity();

                    $scope.loading = false;
                }

                var model = pullFromSession();
                if (model && model.surveyIdentifier === id) {
                    prepareScope(model);
                } else {
                    rookeryCensusProxy.getById($scope, id, prepareScope);
                }
            };


            var save = function(next) {
                // Create or update the survey as appropriate
                if (!$scope.rookeryCensus.surveyIdentifier) {

                    $scope.rookeryCensus.submittedBy = authService.getUserId();

                    rookeryCensusProxy.create($scope, $scope.rookeryCensus, next);
                } else {
                    rookeryCensusProxy.update($scope, $scope.rookeryCensus, next);
                }
            };
            //
            // Configure actions
            //

            $scope.checkValidity = function() {
                $scope.invalid = !(
                    $scope.rookeryCensus.locationId &&
                    $scope.rookeryCensus.startDate &&
                    $scope.rookeryCensus.startTime &&
                    $scope.rookeryCensus.endTime &&
                    $scope.rookeryCensus.prepTimeHours &&
                    $scope.rookeryCensus.startTime < $scope.rookeryCensus.endTime
                );
            };


            $scope.save = function() {
                $scope.loading = true;

                save(function(data) {
                    prepareDateAndTimeForUi(data);
                    $scope.rookeryCensus = data;
                    $scope.loading = false;
                });
            };

            $scope.next = function() {
                $scope.loading = true;

                save(function(data) {
                    $scope.loading = false;

                    saveToSession(data);
                    storeSelectedLocationNameInSession();
                    prepareDateAndTimeForUi(data);

                    // need to pass the survey identifier on to step 2
                    $location.path('/rookery/step2/' + data.surveyIdentifier);
                });
            };


            $scope.back = function() {
                // Should never be invoked
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

            $scope.googleMapsUrl = config.googleMapsUrl;
            $scope.rookeryCensus = {};

            setupDateAndTimeControls();
            configureMapping();
            loadLocations();

            // Configure shared "bottomBar" components
            $scope.canGoBack = false;
            $scope.canSaveForLater = true;

            if ($routeParams.id) {
                loadExistingSurvey($routeParams.id);
            }

            $scope.step = 1;
            $scope.loading = false;
        }
    ]);
