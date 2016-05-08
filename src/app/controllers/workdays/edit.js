'use strict';

flnd.workDayEdit = {
  configureDateField: function($scope) {
    $scope.workday = {};

    $scope.today = moment().format('MM/DD/YY');

    $scope.clear = function () {
        $scope.workday.workDate = null;
    };

    // Disable weekend selection
    $scope.disabled = function (date, mode) {
        return (mode === 'day' && (date.getDay() === 0 || date.getDay() === 6));
    };

    $scope.toggleMin = function () {
        $scope.minDate = $scope.minDate ? null : new Date();
    };
    $scope.toggleMin();
    $scope.maxDate = new Date(2020, 5, 22);

    $scope.open = function () {
        $scope.status.opened = true;
    };

    $scope.setDate = function (year, month, day) {
        $scope.workday.workDate = new Date(year, month, day);
    };

    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };

    $scope.format = 'shortDate';

    $scope.status = {
        opened: false
    };

    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    var afterTomorrow = new Date();
    afterTomorrow.setDate(tomorrow.getDate() + 2);
    $scope.events =
    [
        {
            date: tomorrow,
            status: 'full'
        },
        {
            date: afterTomorrow,
            status: 'partially'
        }
    ];

    $scope.getDayClass = function (date, mode) {
        if (mode === 'day') {
            var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

            for (var i = 0; i < $scope.events.length; i++) {
                var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);

                if (dayToCheck === currentDay) {
                    return $scope.events[i].status;
                }
            }
        }

        return '';
    };
    return $scope;
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

  configureSubmit: function(id, $scope, $log, messenger, authService, $uibModalInstance, config) {
    var $this = this;

    $scope.submit = function() {
        $scope.loading = true;

        var msg = {
            locationId: $scope.workday.location,
            travelTimeHours: $this.dateToHours($scope.workday.travelTime),
            workDate: $scope.workday.workDate,
            workHours:  $this.dateToHours($scope.workday.workTime),
            workTypeId: $scope.workday.workType,
            userId: $scope.workday.userId,
            id: $scope.workday.id,
            numberOfVolunteers: $scope.workday.numberOfVolunteers,
            tasksCompleted: $scope.workday.tasksCompleted
        };

        authService.put(config.workLogs + id, msg)
           .then(function success(){
                if ($uibModalInstance) {
                    $uibModalInstance.close();
                } else {
                    messenger.showSuccessMessage($scope, 'Saved');
                }
           }, function error(response) {
                messenger.displayErrorResponse($scope, response);
           })
           .finally(function(){
                $scope.loading = false;
           });
    };

    return $scope;
  },

  loadRecord: function(id, $scope, $log, messenger, authService, config, _) {
    var $this = this;

    authService.get(config.workLogs + id)
        .then(function success(response) {

            $log.info(response.data);

            $scope.hstep = 1;
            $scope.mstep = 1;
            $scope.workday = {
                location: response.data.locationId,
                workDate: $this.stripTime(response.data.workDate),
                workType: response.data.workTypeId,
                id: response.data.id,
                userId: response.data.userId,
                workTime: $this.hoursToDate(response.data.workHours),
                travelTime: $this.hoursToDate(response.data.travelTimeHours),
                numberOfVolunteers: response.data.numberOfVolunteers,
                tasksCompleted: response.data.tasksCompleted || ''
            };

        }, function error(response) {
            messenger.displayErrorResponse($scope, response);
        });
  },

  dateToHours: function(input) {
    var mom = moment(input);
    var h = mom.format('H').toString();
    var m = (Math.round(mom.format('m') / 0.6 )).toString();
    return h + '.' + m;
  },

  hoursToDate: function(hours) {
    var $this = this;
    var parts = hours.toString().split('.');
    var toParse = { hour: parts[0], minute: 0 };
    if(parts[1]) { toParse.minute = $this.padRight(parts[1],2,'0') * 0.6; }
    return moment(toParse).format();
  },

  padRight: function(input, length, padChar) {
    var output = input;
    while (output.length < length-1) {
        output += padChar;
    }
    return output;
  },

  stripTime: function(dateTime) {
    return moment(dateTime).format('YYYY-MM-DD');
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
    .controller('WorkdayEditController',
        ['$scope', '$location', '$http', '$log', 'messenger', 'authService', '$routeParams', 'id', '$uibModalInstance', 'config',
            function ($scope, $location, $http, $log, messenger, authService, $routeParams, id, $uibModalInstance, config) {
                $scope.loading = true;
                $scope.data = {};

                if (!isFinite(id)) {
                    // garbage input
                    return;
                }


                flnd.workDayEdit.configureDateField($scope);
                flnd.workDayEdit.loadRecord(id, $scope, $log, messenger, authService, config);
                flnd.workDayEdit.loadLocations($scope, $log, messenger, authService, config);
                flnd.workDayEdit.loadWorkTypes($scope, $log, messenger, authService, config);


                if (!(authService.isAdministrator() ||
                      authService.isCoordinator())) {

                    // Non-administrative users must be reporters and can only edit their own data
                    if(!authService.isReporter() || $scope.workday.userId !== authService.getUserId()) {

                        $log.warn('not authorized to access this path');
                        $location.path('/');
                        return;
                    }
                }

                $scope = flnd.workDayEdit.configureSubmit(id, $scope, $log, messenger, authService, $uibModalInstance, config);

                $scope.cancel = function() {
                    if ($uibModalInstance) {
                        $uibModalInstance.close();
                    } else {
                        $location.path('/workdays');
                    }
                };

                $scope.loading = false;
            }]);