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
        'authService', '$routeParams', 'config', '$filter', 'timeDateUtility', 'NgMap', 'locationProxy',
        function($scope, $location, $http, $log, messenger, authService,
            $routeParams, config, $filter, timeDateUtility, NgMap, locationProxy) {
            $scope.loading = true;
            $scope.data = {};

            var id = $routeParams.id;



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

            var loadRecord = function(id) {

                authService.get(config.workLogs + id)
                    .then(function success(response) {

                        $scope.hstep = 1;
                        $scope.mstep = 1;
                        $scope.workday = {
                            locationId: response.data.locationId,
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
                    id: $scope.workday.id,
                    numberOfVolunteers: $scope.workday.numberOfVolunteers,
                    tasksCompleted: $scope.workday.tasksCompleted
                };

                authService.put(config.workLogs + id, msg)
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
                if ($location.$$path.includes('edit')) {
                    $location.path('/workdays/all');
                } else {
                    $location.path('/workdays');
                }
            };

            //
            // Main program flow
            //

            $scope.workday = {};

            loadRecord(id);
            loadLocations();
            loadWorkTypes();
            configureMapping();

            $scope.googleMapsUrl = config.googleMapsUrl;


            $scope.loading = false;
        }
    ]);
