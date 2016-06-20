'use strict';

flnd.workDayCreate = {
    // TODO: remove some code duplication in here, createForuser, and edit
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

    configureSubmit: function($scope, $log, messenger, authService, $uibModalInstance, config) {
        var $this = this;

        $scope.submit = function() {
            $scope.loading = true;

            var msg = {
                locationId: $scope.workday.location,
                travelTimeHours: $this.dateToHours($scope.workday.travelTime),
                workDate: $scope.workday.workDate,
                workHours: $this.dateToHours($scope.workday.workTime),
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
    },

    dateToHours: function(input) {
        var mom = moment(input);
        var h = mom.format('H').toString();
        var m = (Math.round(mom.format('m') / 0.6)).toString();
        return h + '.' + m;
    },

    initializeTimeFields: function($scope) {
        $scope.hstep = 1;
        $scope.mstep = 1;
        var begin = moment('1970-01-01 00:00:00.000').toDate();
        $scope.workday.workTime = begin;
        $scope.workday.travelTime = begin;
    }
};

/**
 * @ngdoc function
 * @name flightNodeApp.controller:WorkdayCreateController
 * @description
 * # WorkdayController
 * Controller for the workday logging page.
 */
angular.module('flightNodeApp')
    .controller('WorkdayCreateController', ['$scope', '$location', '$http', '$log', 'messenger', 'authService', '$uibModalInstance', 'config', '$filter',
        function($scope, $location, $http, $log, messenger, authService, $uibModalInstance, config, $filter) {
            $scope.loading = true;
            $scope.data = {};

            $scope.workday = {};

            flnd.workDayCreate.configureDateField($scope, $filter);
            flnd.workDayCreate.loadWorkTypes($scope, $log, messenger, authService, config);
            flnd.workDayCreate.loadLocations($scope, $log, messenger, authService, config);

            flnd.workDayCreate.configureSubmit($scope, $log, messenger, authService, $uibModalInstance, config);

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
