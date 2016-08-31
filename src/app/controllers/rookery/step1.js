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
                $scope.updateStartDate = function() {
                    $scope.rookeryCensus.startDate = new Date($scope.rookeryCensus.startDateManual);
                };
                $scope.updateStartDateManual = function() {
                    $scope.rookeryCensus.startDateManual = $filter('date')($scope.rookeryCensus.startDate, 'MM/dd/yyyy');
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

            var loadLocations = function() {
                locationProxy.get($scope, function(data) {
                    $scope.locations = data;
                });
            };

            var storeSelectedLocationNameInSession = function() {
                var location = _.keyBy($scope.locations, function(l) {
                    return l.id;
                })[$scope.rookeryCensus.locationId];
                var locationName = location.siteCode + ' - ' + location.siteName;

                saveToSession({ locationName: locationName }, locationNameKey);
            };

            var loadExistingSurvey = function(id) {
                $scope.loading = true;

                rookeryCensusProxy.getById($scope, id, function(data) {

                    prepareDateAndTimeForUi(data);
                    $scope.rookeryCensus = data;

                    $scope.loading = false;
                });
            }

            //
            // Configure button actions
            //
            $scope.next = function() {
                $scope.loading = true;

                var next = function(data) {
                    $scope.loading = false;

                    saveToSession(data);
                    storeSelectedLocationNameInSession();

                    // need to pass the survey identifier on to step 2
                    $location.path('/rookery/step2/' + data.surveyIdentifier);
                }

                // Create or update the survey as appropriate
                if (!$scope.rookeryCensus.surveyIdentifier) {
                    rookeryCensusProxy.create($scope, $scope.rookeryCensus, function(data) {
                        next(data);
                    });
                } else {
                    rookeryCensusProxy.update($scope, $scope.rookeryCensus, function(data) {
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
                    $location.path('/rookery/step1');

                }, function dismissed() {
                    // do nothing
                });
            };

            //
            // Main program flow
            //
            $scope.loading = true;

            setupDateAndTimeControls();
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
