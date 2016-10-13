'use strict';

/**
 * @ngdoc function
 * @name flightNodeApp.controller:ForagingStep2Controller
 * @description
 * # ForagingStep2Controller
 * Controller for rookery foraging census form, step 2.
 */
angular.module('flightNodeApp')
    .controller('ForagingStep2Controller', ['$scope', 'authService', 'config', 'messenger',
        'foragingSurveyProxy', '$filter', '$location', '$log', 'locationProxy', 'enumsProxy',
        '$route', '$uibModal', 'birdsProxy', '$routeParams',
        function($scope, authService, config, messenger,
            foragingSurveyProxy, $filter, $location, $log, locationProxy, enumsProxy,
            $route, $uibModal, birdsProxy, $routeParams) {


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
                $scope.hstep = 1;
                $scope.mstep = 1;
            };


            var prepareTimeForUi = function(model) {
                // need to convert to a a real Date object to support timepicker
                var format = 'MM/DD/YYYY hh:mm a';
                if (model.timeLowTide && model.timeLowTide.includes('M')) {
                    model.timeLowTide = moment(model.startDate + ' ' + model.timeLowTide, format).toDate();
                }
            }

            var loadEnums = function() {
                // TODO: look into caching this cleanly
                if (!$scope.enums) {
                    enumsProxy.getForForagingSurvey($scope, function(data) {
                        $scope.enums = data;
                    });
                }
            };

            var saveAndMoveTo = function(nextPath) {
                $scope.loading = true;

                $scope.foragingSurvey.windDrivenTide = $scope.foragingSurvey.windDrivenTide || false;

                foragingSurveyProxy.update($scope, $scope.foragingSurvey, function(data) {

                    saveToSession(data);

                    $scope.loading = false;

                    $location.path(nextPath + data.surveyIdentifier);
                });
            };

            //
            // Configure button actions
            //
            $scope.next = function() {
                // need to pass the survey identifier on to step 3
                saveAndMoveTo('/foraging/step3/');
            };


            $scope.save = function() {
                $scope.loading = true;

                $scope.foragingSurvey.windDrivenTide = $scope.foragingSurvey.windDrivenTide || false;

                foragingSurveyProxy.update($scope, $scope.foragingSurvey, function() {
                    $scope.loading = false;
                });
            };

            $scope.back = function() {
                // need to pass the survey identifier on to step 1
                saveAndMoveTo('/foraging/step1/');
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
            $scope.loading = true

            loadEnums();
            $scope.foragingSurvey = pullFromSession();
            $scope.locationName = pullFromSession(locationNameKey).locationName;

            setupDateAndTimeControls();
            prepareTimeForUi($scope.foragingSurvey);

            $scope.step = 2;
            // Configure shared "bottomBar" components
            $scope.canGoBack = true;
            $scope.canSaveForLater = true;

            $scope.loading = false;
        }
    ]);
