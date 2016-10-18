'use strict';

/**
 * @ngdoc function
 * @name flightNodeApp.controller:WorkdayEditController
 * @description
 * # WorkdayController
 * Controller for the workday logging page.
 */
angular.module('flightNodeApp')
    .controller('WorkdayEditController', ['$scope', '$location', '$http', '$log', 'messenger',
        'authService', '$routeParams', 'id', '$uibModalInstance', 'config', '$filter', 'timeDateUtility',
        function($scope, $location, $http, $log, messenger, authService,
            $routeParams, id, $uibModalInstance, config, $filter, timeDateUtility) {
            $scope.loading = true;
            $scope.data = {};

            if (!isFinite(id)) {
                // garbage input
                return;
            }


            if (!authService.isAdministrator()) {

                // Non-administrative users must be reporters and can only edit their own data
                if (!authService.isAuthorized() || $scope.workday.userId !== authService.getUserId()) {

                    $log.warn('not authorized to access this path');
                    $location.path('/');
                    return;
                }
            }


            var configureDateField = function() {
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

            var configureSubmit = function(id) {

                $scope.submit = function() {
                    $scope.loading = true;

                    var msg = {
                        locationId: $scope.workday.location,
                        travelTimeHours: timeDateUtility.dateToHours($scope.workday.travelTime),
                        workDate: $scope.workday.workDate,
                        workHours: timeDateUtility.dateToHours($scope.workday.workTime),
                        workTypeId: $scope.workday.workType,
                        userId: $scope.workday.userId,
                        id: $scope.workday.id,
                        numberOfVolunteers: $scope.workday.numberOfVolunteers,
                        tasksCompleted: $scope.workday.tasksCompleted
                    };

                    authService.put(config.workLogs + id, msg)
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

            var loadRecord = function(id) {

                authService.get(config.workLogs + id)
                    .then(function success(response) {

                        $scope.hstep = 1;
                        $scope.mstep = 1;
                        $scope.workday = {
                            location: response.data.locationId,
                            workDate: $filter('date')(response.data.workDate, 'MM/dd/yyyy'),
                            workType: response.data.workTypeId,
                            id: response.data.id,
                            userId: response.data.userId,
                            workTime: timeDateUtility.hoursToDate(response.data.workHours),
                            travelTime: timeDateUtility.hoursToDate(response.data.travelTimeHours),
                            numberOfVolunteers: response.data.numberOfVolunteers,
                            tasksCompleted: response.data.tasksCompleted || '',
                            workDateManual: $filter('date')(response.data.workDate, 'MM/dd/yyyy'),
                            volunteerName: response.data.volunteerName
                        };

                    }, function error(response) {
                        messenger.displayErrorResponse($scope, response);
                    });
            };


            $scope.workday = {};

            configureDateField();
            loadRecord(id);
            loadLocations();
            loadWorkTypes();
            configureSubmit(id);

            $scope.cancel = function() {
                if ($uibModalInstance) {
                    $uibModalInstance.dismiss();
                } else {
                    $location.path('/workdays');
                }
            };

            $scope.loading = false;
        }
    ]);
