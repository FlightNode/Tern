'use strict';

/**
 * @ngdoc function
 * @name flightNodeApp.controller:RookeryCensusStep2Controller
 * @description
 * # RookeryCensusStep2Controller
 * Controller for rookery census form, step 2.
 */
angular.module('flightNodeApp')
    .controller('RookeryCensusStep2Controller', ['$scope', 'authService', 'config', 'messenger',
        'rookeryCensusProxy', '$filter', '$location', '$log', 'locationProxy', 'enumsProxy',
        '$route', '$uibModal', 'birdsProxy', '$routeParams',
        function($scope, authService, config, messenger,
            rookeryCensusProxy, $filter, $location, $log, locationProxy, enumsProxy,
            $route, $uibModal, birdsProxy, $routeParams) {


            if (!(authService.isAuthorized())) {
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

                rookeryCensusProxy.update($scope, $scope.rookeryCensus, function(data) {

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
                saveAndMoveTo('/rookery/step3/');
            };


            $scope.back = function() {
                // need to pass the survey identifier on to step 1
                saveAndMoveTo('/rookery/step1/');
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

            loadEnums();
            $scope.rookeryCensus = pullFromSession();
            $scope.locationName = pullFromSession(locationNameKey).locationName;


            $scope.step = 2;
            // Configure shared "bottomBar" components
            $scope.canGoBack = true;
            $scope.canSaveForLater = true;

            $scope.loading = false;
        }
    ]);
