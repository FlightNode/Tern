'use strict';



/**
 * @ngdoc function
 * @name flightNodeApp.controller:WorkdayCreateForUserController
 * @description
 * # WorkdayCreateForUserController
 * Controller for the workday logging page.
 */
angular.module('flightNodeApp')
    .controller('WorkdayCreateForUserController', ['$scope', '$location', '$http', '$log',
        'messenger', 'authService', 'config', '$filter', 'timeDateUtility', 'NgMap', 'locationProxy',
        function($scope, $location, $http, $log, messenger,
            authService, config, $filter, timeDateUtility, NgMap, locationProxy) {
            $scope.loading = true;
            $scope.data = {};
            $scope.workday = {};



            //
            // Helper functions
            //


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
                    $scope.workday.locationId = $scope.mappableLocations[index].id;
                    return false;
                };
            };

            var loadLocations = function() {
                locationProxy.get($scope, function(data) {
                    // For dropdown
                    $scope.data.locations = _.map(data, function(location) {
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

            var loadWorkTypes = function() {
                authService.get(config.workTypesSimpleList)
                    .then(function success(response) {

                        $scope.data.worktypes = response.data;

                    }, function error(response) {

                        messenger.displayErrorResponse($scope, response);

                    });
            };

            var loadUsers = function() {
                authService.get(config.usersSimpleList)
                    .then(function success(response) {

                        $scope.data.users = response.data;

                    }, function error(response) {

                        messenger.displayErrorResponse($scope, response);

                    });
            };

            var initializeTimeFields = function() {
                $scope.hstep = 1;
                $scope.mstep = 1;
                var begin = moment('1970-01-01 00:00:00.000').toDate();
                $scope.workday.workTime = begin;
                $scope.workday.travelTime = begin;
            };


            //
            // Configure actions
            //
            $scope.save = function() {
                $scope.loading = true;

                var msg = {
                    locationId: $scope.workday.locationId,
                    travelTimeHours: timeDateUtility.dateToHours($scope.workday.travelTime),
                    workDate: $scope.workday.workDate,
                    workHours: timeDateUtility.dateToHours($scope.workday.workTime),
                    workTypeId: $scope.workday.workType,
                    userId: $scope.workday.userId,
                    numberOfVolunteers: $scope.workday.numberOfVolunteers,
                    tasksCompleted: $scope.workday.tasksCompleted
                };

                authService.post(config.workLogs, msg)
                    .then(function success() {
                            messenger.showSuccessMessage($scope, 'Saved');

                    }, function error(response) {

                        messenger.displayErrorResponse($scope, response);
                    })
                    .finally(function() {
                        $scope.loading = false;
                    });
            };

            $scope.cancel = function() {
                $location.path('/workdays/all');
            };

            //
            // Main program flow
            //

            loadWorkTypes();
            loadLocations();
            loadUsers();
            configureMapping();
            initializeTimeFields();

            $scope.googleMapsUrl = config.googleMapsUrl;

            $scope.loading = false;
        }
    ]);
