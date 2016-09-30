'use strict';

flnd.workDayEdit = {
    configureDateField: function($scope, $filter) {
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
    },

    loadLocations: function($scope, $log, messenger, authService, config) {
        authService.get(config.locationsSimpleList)
            .then(function success(response) {

                $scope.data.locations = response.data;

            }, function error(response) {
                messenger.displayErrorResponse($scope, response);
            });
    },

    loadWorkTypes: function($scope, $log, messenger, authService, config) {
        authService.get(config.workTypesSimpleList)
            .then(function success(response) {

                $scope.data.worktypes = response.data;

            }, function error(response) {
                messenger.displayErrorResponse($scope, response);
            });
    },

    configureSubmit: function(id, $scope, $log, messenger, authService, $uibModalInstance, config, $filter) {
        var $this = this;

        $scope.submit = function() {
            $scope.loading = true;

            var msg = {
                locationId: $scope.workday.location,
                travelTimeHours:  $this.dateToHours($scope.workday.travelTime),
                workDate: $scope.workday.workDate,
                workHours: $this.dateToHours($scope.workday.workTime),
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
    },

    loadRecord: function(id, $scope, $log, messenger, authService, config, $filter) {
        var $this = this;

        authService.get(config.workLogs + id)
            .then(function success(response) {

                $scope.hstep = 1;
                $scope.mstep = 1;
                $scope.workday = {
                    location: response.data.locationId,
                    workDate: $filter('date')(response.data.workDate,'MM/dd/yyyy'),
                    workType: response.data.workTypeId,
                    id: response.data.id,
                    userId: response.data.userId,
                    workTime: $this.hoursToDate(response.data.workHours),
                    travelTime: $this.hoursToDate(response.data.travelTimeHours),
                    numberOfVolunteers: response.data.numberOfVolunteers,
                    tasksCompleted: response.data.tasksCompleted || '',
                    workDateManual: $filter('date')(response.data.workDate,'MM/dd/yyyy')
                };

            }, function error(response) {
                messenger.displayErrorResponse($scope, response);
            });
    },

    dateToHours: function(input) {
        var mom = moment(input);
        var h = mom.format('H').toString();
        var m = (Math.round(mom.format('m') / 0.6)).toString();
        return h + '.' + m;
    },

    hoursToDate: function(hours) {
        var $this = this;
        var parts = hours.toString().split('.');
        var toParse = { hour: parts[0], minute: 0 };
        if (parts[1]) { toParse.minute = $this.padRight(parts[1], 2, '0') * 0.6; }
        return moment(toParse).format();
    },

    padRight: function(input, length, padChar) {
        var output = input;
        while (output.length < length - 1) {
            output += padChar;
        }
        return output;
    }
};

/**
 * @ngdoc function
 * @name flightNodeApp.controller:WorkdayEditController
 * @description
 * # WorkdayController
 * Controller for the workday logging page.
 */
angular.module('flightNodeApp')
    .controller('WorkdayEditController', ['$scope', '$location', '$http', '$log', 'messenger', 'authService', '$routeParams', 'id', '$uibModalInstance', 'config', '$filter',
        function($scope, $location, $http, $log, messenger, authService, $routeParams, id, $uibModalInstance, config, $filter) {
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

            $scope.workday = {};

            flnd.workDayEdit.configureDateField($scope, $filter);
            flnd.workDayEdit.loadRecord(id, $scope, $log, messenger, authService, config, $filter);
            flnd.workDayEdit.loadLocations($scope, $log, messenger, authService, config);
            flnd.workDayEdit.loadWorkTypes($scope, $log, messenger, authService, config);
            flnd.workDayEdit.configureSubmit(id, $scope, $log, messenger, authService, $uibModalInstance, config, $filter);

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
