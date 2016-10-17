'use strict';



/**
 * @ngdoc function
 * @name flightNodeApp.controller:WorkdayCreateController
 * @description
 * # WorkdayController
 * Controller for the workday logging page.
 */
angular.module('flightNodeApp')
    .controller('WorkdayCreateController', ['$scope', '$location', '$http', '$log', 'messenger',
        'authService', '$uibModalInstance', 'config', '$filter', 'timeDateUtility',
        function($scope, $location, $http, $log, messenger,
            authService, $uibModalInstance, config, $filter, timeDateUtility) {
            $scope.loading = true;
            $scope.data = {};

            $scope.workday = {};


            // TODO: remove some code duplication in here, createForuser, and edit
            var configureDateField = function($scope, $filter) {
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
                    $scope.workDateOpened = !$scope.workDateOpened;
                };
                $scope.updateWorkDate = function() {
                    $scope.workday.workDate = new Date($scope.workday.workDateManual);
                }
                $scope.updateWorkDateManual = function() {
                    $scope.workday.workDateManual = $filter('date')($scope.workday.workDate, 'MM/dd/yyyy');
                }
            };

            var loadLocations = function() {
                authService.get(config.locationsSimpleList)
                    .then(function success(response) {

                        $scope.data.locations = response.data;

                    }, function error(response) {

                        messenger.displayErrorResponse($scope, response);
                    });
            };

            var loadWorkTypes = function() {
                authService.get(config.workTypesSimpleList)
                    .then(function success(response) {

                        $scope.data.worktypes = response.data;

                    }, function error(response) {

                        messenger.displayErrorResponse($scope, response);

                    });
            };

            var configureSubmit = function() {
                $scope.submit = function() {
                    $scope.loading = true;

                    var msg = {
                        locationId: $scope.workday.location,
                        travelTimeHours: timeDateUtility.dateToHours($scope.workday.travelTime),
                        workDate: $scope.workday.workDate,
                        workHours: timeDateUtility.dateToHours($scope.workday.workTime),
                        workTypeId: $scope.workday.workType,
                        userId: authService.getUserId(),
                        numberOfVolunteers: $scope.workday.numberOfVolunteers,
                        tasksCompleted: $scope.workday.tasksCompleted
                    };

                    authService.post(config.workLogs, msg)
                        .then(function success() {
                            if ($uibModalInstance) {
                                $uibModalInstance.close();
                            } else {
                                messenger.showSuccessMessage($scope, 'Saved');
                            }

                        }, function error(response) {
                            messenger.displayErrorResponse($scope, response);
                        })
                        .finally(function() {
                            $scope.loading = false;
                        });
                };
            };


            var initializeTimeFields = function() {
                $scope.hstep = 1;
                $scope.mstep = 1;
                var begin = moment('1970-01-01 00:00:00.000').toDate();
                $scope.workday.workTime = begin;
                $scope.workday.travelTime = begin;
            };


            configureDateField($scope, $filter);
            loadWorkTypes($scope, $log, messenger, authService, config);
            loadLocations($scope, $log, messenger, authService, config);
            configureSubmit($scope, $log, messenger, authService, $uibModalInstance, config);

            $scope.cancel = function() {
                if ($uibModalInstance) {
                    $uibModalInstance.dismiss();
                } else {
                    $location.path('/workdays');
                }
            };

            flnd.workDayCreate.initializeTimeFields($scope);

            $scope.loading = false;
        }
    ]);
