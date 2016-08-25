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


            if (!(authService.isReporter())) {
                $log.warn('not authorized to access this path');
                $location.path('/');
                return;
            }

            //
            // Helper functions
            //
            var modelKey = "foragingSurveyModel";

            var saveToSession = function(data) {
                sessionStorage.setItem(modelKey, JSON.stringify(data));
            };

            var pullFromSession = function() {
                var stored = sessionStorage.getItem(modelKey);
                stored = stored === "undefined" ? undefined : stored;
                if (stored) {
                    return JSON.parse(stored || {});
                }
                return null;
            };

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


            $scope.back = function() {
                // need to pass the survey identifier on to step 1
                saveAndMoveTo('/foraging/step1/');
            };

            $scope.reset = function() {
                // TODO: what is the function of this now? Need to rethink
                // this "reset" button. Maybe unnecessary. 

                var modal = $uibModal.open({
                    animation: true,
                    templateUrl: '/app/views/confirmResetForm.html',
                    backdrop: true,
                    size: 'sm'
                });
                modal.result.then(function success() {

                    // Reload the first page
                    $location.path('/foraging');

                }, function dismissed() {
                    // do nothing
                });
            };


            //
            // Main program flow
            //
            $scope.loading = true;

            loadEnums();
            $scope.foragingSurvey = pullFromSession();

            // Configure shared "bottomBar" components
            $scope.canGoBack = true;
            $scope.canSaveForLater = true;

            $scope.loading = false;
        }
    ]);
