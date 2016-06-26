'use strict';

/**
 * @ngdoc function
 * @name flightNodeApp.controller:ForagingCreateController
 * @description
 * # ForagingCreateController
 * Controller for the create census form.
 */
angular.module('flightNodeApp')
    .controller('ForagingCreateController', ['$scope', 'authService', 'config', 'messenger',
        'foragingSurveyProxy', '$filter', '$location', '$log', 'locationProxy', 'enumsProxy',
        '$route', '$uibModal',
        function($scope, authService, config, messenger,
            foragingSurveyProxy, $filter, $location, $log, locationProxy, enumsProxy,
            $route, $uibModal) {


            if (!(authService.isReporter())) {
                $log.warn('not authorized to access this path');
                $location.path('/');
                return;
            }

            $scope.loading = true;

            var modelKey = 'foragingSurvey';
            var enumsKey = 'enums';
            var birdsKey = 'birdSpeciesList';
            var locationsKey = 'locations';


            // Setup date and time controls
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
            $scope.updateStartDate = function() {
                $scope.foragingSurvey.startDate = new Date($scope.foragingSurvey.startDateManual);
            };
            $scope.updateStartDateManual = function() {
                $scope.foragingSurvey.startDateManual = $filter('date')($scope.foragingSurvey.startDate, 'MM/dd/yyyy');
            };
            $scope.hstep = 1;
            $scope.mstep = 1;


            var saveToSesion = function(key, data) {
                sessionStorage.setItem(key, JSON.stringify(data));
            };

            var pullFromSession = function(key) {
                var stored = sessionStorage.getItem(key);
                if (stored) {
                    return JSON.parse(stored);
                }
                return null;
            };

            var pullModelFromSession = function() {
                var model = pullFromSession(modelKey) || {};

                // need to convert to a a real Date object to support timepicker
                var format = 'YYYY-MM-DD hh:mm a';
                if (model.startTime && model.startTime.includes('M')) {
                    model.startTime = moment('1970-01-01 ' + model.startTime, format).toDate();
                }
                if (model.endTime && model.endTime.includes('M')) {
                    model.endTime = moment('1970-01-01 ' + model.endTime, format).toDate();
                }

                model.startDateManual = model.startDate;
                model.startDate = moment(model.startDate, 'MM/DD/YYYY').toDate();
                return model;
            };

            // Prepare data - first try pulling from sessionStorage if available
            $scope.foragingSurvey = pullModelFromSession(modelKey);
            if (!$scope.foragingSurvey) {
                var begin = moment('1970-01-01 00:00:00.000').toDate();
                $scope.foragingSurvey = {
                    observations: [],
                    disturbances: [],
                    startTime: begin,
                    endTime: begin
                };
            }

            $scope.enums = pullFromSession(enumsKey);
            if (!$scope.enums) {
                enumsProxy.getForForagingSurvey($scope, function(data) {
                    $scope.enums = data;
                    saveToSesion(enumsKey, data);
                });
            }

            $scope.locations = pullFromSession(locationsKey);
            if (!$scope.locations) {
                locationProxy.get($scope, function(data) {
                    $scope.locations = data;
                    saveToSesion(locationsKey, data);
                });
            }


            var step = $route.current.step;
            $scope.step = step;
            $scope.canGoBack = (step > 1);
            $scope.canSaveForLater = (step < 5);

            $scope.birdSpeciesList = pullFromSession(birdsKey);
            if (step === 3) {
                if (!$scope.birdSpeciesList || $scope.birdSpeciesList.length === 0) {

                    // TODO: pull this into bird proxy with getBySurveyTypeId(id)
                    authService.get(config.birdspecies + '?surveyTypeId=2')
                        .then(function success(response) {

                            $scope.birdSpeciesList = response.data;
                            saveToSesion(birdsKey, $scope.birdSpeciesList);

                        }, function error(response) {

                            messenger.displayErrorResponse($scope, response);

                        });
                }
            }

            $scope.getLocationName = function() {
                var id = $scope.foragingSurvey.locationId;
                var location = _.find($scope.locations, { id: id });
                return location.siteCode + ' - ' + location.siteName;
            };
            $scope.getSiteType = function () {
                var id = +$scope.foragingSurvey.siteTypeId;
                var siteType = _.find($scope.enums.siteTypeInfo, { id: id });
                return siteType.description;
            };
            $scope.getTide = function () {
                var id = +$scope.foragingSurvey.tideId;
                var siteType = _.find($scope.enums.tideInfo, { id: id });
                return siteType.description;
            };
            $scope.getWeather = function () {
                var id = +$scope.foragingSurvey.weatherId;
                var siteType = _.find($scope.enums.weatherInfo, { id: id });
                return siteType.description;
            };
            $scope.getVantagePoint = function () {
                var id = +$scope.foragingSurvey.vantagePointId;
                var siteType = _.find($scope.enums.vantagePointInfo, { id: id });
                return siteType.description;
            };
            $scope.getAccessPoint = function () {
                var id = +$scope.foragingSurvey.accessPointId;
                var siteType = _.find($scope.enums.accessPointInfo, { id: id });
                return siteType.description;
            };
            $scope.getCommonName = function(id) {
                return _.find($scope.birdSpeciesList, { id: id });
            };
            $scope.getActivity = function(id) {
                return _.find($scope.enums.behaviorTypeInfo, { id: id });
            };


            //Method to set the birdSpeciesId from the UI.
            $scope.setBirdId = function(index, birdSpeciesId) {
                var observation = $scope.foragingSurvey.observations[index];
                observation.birdSpeciesId = birdSpeciesId;
                observation.invalid = (
                    (observation.adults > 0 ||
                        observation.juveniles > 0) &&
                    (observation.primaryActivityId === undefined ||
                        observation.secondaryActivityId === undefined ||
                        observation.habitatId === undefined ||
                        observation.feedingId === undefined)
                ) || observation.adults < 0 || observation.juveniles < 0;


                $scope.observationForm.invalid = _.some($scope.foragingSurvey.observations, 'invalid');
            };

            //Method to set the disturbanceTypeId from the UI.
            $scope.setDisturbanceTypeId = function(index, disturbanceTypeId) {
                var disturbance = $scope.foragingSurvey.disturbances[index];
                disturbance.disturbanceTypeId = disturbanceTypeId;
                disturbance.invalid = (
                    // when any column is set
                    (disturbance.quantity > 0 || disturbance.durationMinutes > 0 || disturbance.behavior) &&
                    // then all of them are needed
                    !(disturbance.quantity > 0 && disturbance.durationMinutes > 0 && disturbance.behavior)
                );

                $scope.disturbanceForm.invalid = _.some($scope.foragingSurvey.disturbances, 'invalid');
            };


            var saveModelToSesion = function(data) {
                saveToSesion(modelKey, data);
            };

            $scope.save = function(next) {
                next = next || function() {}; // because this can be called directly without a callback

                $scope.loading = true;

                var model = $scope.foragingSurvey;

                if (model.surveyIdentifier) {
                    foragingSurveyProxy.update($scope, model, function() {
                        // save the original model to session for the next page
                        saveModelToSesion(model);

                        $scope.loading = false;

                        next();
                    });
                } else {
                    foragingSurveyProxy.create($scope, model, function(data) {
                        // save the modified model to session for the next page
                        saveModelToSesion(data);

                        $scope.loading = false;

                        next();
                    });
                }
            };

            $scope.next = function() {
                var finished = $scope.foragingSurvey.finished = (step === 5);

                $scope.save(function() {
                    if (finished) {
                        // this is the last step. Here we need to show
                        // the pending survey results. This next() function
                        // is called when the users clicks "Finish".
                        // so we save (which is already done above), but 
                        // need to modify pass a "finished" flag.
                        // 

                        // Flush the session
                        // saveModelToSesion(null);
                    } else {
                        $location.path('/foraging/create' + (step + 1).toString());
                    }
                });
            };


            $scope.back = function() {
                $scope.save(function() {
                    $location.path('/foraging/create' + (step - 1).toString());
                });
            };

            $scope.reset = function() {
                var modal = $uibModal.open({
                    animation: true,
                    templateUrl: '/app/views/confirmResetForm.html',
                    backdrop: true,
                    size: 'sm'
                });
                modal.result.then(function success() {
                    saveModelToSesion(null);
                    $location.path('/foraging');
                }, function dismissed() {
                    // do nothing
                });
            };

            $scope.loading = false;
        }
    ]);
