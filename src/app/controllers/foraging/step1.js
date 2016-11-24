'use strict';

/**
 * @ngdoc function
 * @name flightNodeApp.controller:ForagingStep1Controller
 * @description
 * # ForagingStep1Controller
 * Controller for rookery foraging census form, step 1: Location, Date, and Time.
 */
angular.module('flightNodeApp')
    .controller('ForagingStep1Controller', ['$scope', 'authService', 'config', 'messenger',
        'foragingSurveyProxy', '$filter', '$location', '$log', 'locationProxy', 'enumsProxy',
        '$route', '$uibModal', 'birdsProxy', '$routeParams', 'NgMap',
        function($scope, authService, config, messenger,
            foragingSurveyProxy, $filter, $location, $log, locationProxy, enumsProxy,
            $route, $uibModal, birdsProxy, $routeParams, NgMap) {


            if (!(authService.isAuthorized())) {
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

            var setupDateAndTimeControls = function() {
                $scope.startDateOpened = false;
                $scope.datePickerOptions = {
                    formatYear: 'yy',
                    formatMonth: 'MM',
                    maxMode: 'day',
                    maxDate: new Date(2021, 1, 1),
                    minDate: new Date(1990, 1, 1),
                    startingDay: 1
                };
                $scope.datePickerModelOptions = {
                    allowInvalid: true
                };
                $scope.showDatePicker = function() {
                    $scope.startDateOpened = !$scope.startDateOpened;
                };
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

                model.startDateManual = model.startDate;
                // The date in session depends on how it came back from the server after a save
                var temp = moment(model.startDate, 'MM/DD/YYYY');
                if (!temp.isValid()) {
                    temp = moment(model.startDate);
                }
                model.startDate = temp.toDate();
            }

            var configureMapping = function() {
                    NgMap.getMap().then(function(map) {
                        $scope.map = map;
                    });

                    $scope.showLocation = function(evt, id) {
                        $scope.site = $scope.mappableLocations[id];
                        $scope.map.showInfoWindow('info', this);
                    };
                };

            var loadLocations = function() {
                locationProxy.get($scope, function(data) {
                    // For dropdown
                    $scope.locations = _.map(data, function(location) {
                        return {
                            id: location.id,
                            value: location.siteName
                        };
                    });
                    // For map
                    $scope.mappableLocations = _.chain(data).map(function(location) {
                        return {
                            position: [location.latitude, location.longitude],
                            name: location.siteName,
                            siteCode: location.siteCode,
                            city: location.city,
                            county: location.county
                        };
                    }).value();


                });
            };

            var storeSelectedLocationNameInSession = function() {
                var location = _.keyBy($scope.locations, function(l) {
                    return l.id;
                })[$scope.foragingSurvey.locationId];
                var locationName = location.value;

                saveToSession({ locationName: locationName }, locationNameKey);
            };

            var loadExistingSurvey = function(id) {
                $scope.loading = true;

                foragingSurveyProxy.getById($scope, id, function(data) {

                    prepareDateAndTimeForUi(data);
                    $scope.foragingSurvey = data;

                    $scope.checkValidity();

                    $scope.loading = false;
                });
            };

            //
            // Configure actions
            //

            $scope.checkValidity = function() {
                $scope.invalid = !(
                    $scope.foragingSurvey.locationId &&
                    $scope.foragingSurvey.startDate &&
                    $scope.foragingSurvey.startTime &&
                    $scope.foragingSurvey.endTime &&
                    $scope.foragingSurvey.prepTimeHours &&
                    $scope.foragingSurvey.startTime < $scope.foragingSurvey.endTime
                );
            };


            $scope.updateStartDate = function() {
                $scope.foragingSurvey.startDate = new Date($scope.foragingSurvey.startDateManual);
                $scope.checkValidity();
            };
            $scope.updateStartDateManual = function() {
                $scope.foragingSurvey.startDateManual = $filter('date')($scope.foragingSurvey.startDate, 'MM/dd/yyyy');
                $scope.checkValidity();
            };

            $scope.save = function() {
                $scope.loading = true;

                // Create or update the survey as appropriate
                if (!$scope.foragingSurvey.surveyIdentifier) {

                    $scope.foragingSurvey.submittedBy = authService.getUserId();

                    foragingSurveyProxy.create($scope, $scope.foragingSurvey, function(data) {
                        $scope.foragingSurvey = data;
                        $scope.loading = false;
                    });
                } else {
                    foragingSurveyProxy.update($scope, $scope.foragingSurvey, function(data) {
                        $scope.foragingSurvey = data;
                        $scope.loading = false;
                    });
                }

            };

            $scope.next = function() {
                $scope.loading = true;

                var next = function(data) {
                    $scope.loading = false;

                    saveToSession(data);
                    storeSelectedLocationNameInSession();

                    // need to pass the survey identifier on to step 2
                    $location.path('/foraging/step2/' + data.surveyIdentifier);
                }

                // Create or update the survey as appropriate
                if (!$scope.foragingSurvey.surveyIdentifier) {

                    $scope.foragingSurvey.submittedBy = authService.getUserId();

                    foragingSurveyProxy.create($scope, $scope.foragingSurvey, function(data) {
                        next(data);
                    });
                } else {
                    foragingSurveyProxy.update($scope, $scope.foragingSurvey, function(data) {
                        next(data);
                    });
                }

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
                    $location.path('/foraging/step1');

                }, function dismissed() {
                    // do nothing
                });
            };

            //
            // Main program flow
            //
            $scope.loading = true;


            $scope.googleMapsUrl = config.googleMapsUrl;

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
