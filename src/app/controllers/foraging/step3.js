'use strict';

/**
 * @ngdoc function
 * @name flightNodeApp.controller:ForagingStep3Controller
 * @description
 * # ForagingStep3Controller
 * Controller for rookery foraging census form, step 3.
 */
angular.module('flightNodeApp')
    .controller('ForagingStep3Controller', ['$scope', 'authService', 'config', 'messenger',
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

            var loadAvailableBirds = function() {
                // TODO: reconsider caching locally

                birdsProxy.getForagingBirds($scope, function(data) {

                    // Change it to a dictionary and load into scope
                    $scope.birdSpeciesList = _.keyBy(data, function(o) {
                        return o.id;
                    });

                });
            };

            var updateBirdSpeciesListFromExistingObservations = function() {
                if ($scope.foragingSurvey.observations &&
                    $scope.foragingSurvey.observations.length > 0) {

                    _.each($scope.foragingSurvey.observations, function(observation) {

                        var item = $scope.birdSpeciesList[observation.birdSpeciesId];

                        item.observationId = observation.observationId;
                        item.adults = observation.adults;
                        item.juveniles = observation.juveniles;
                        item.feedingId = observation.feedingId;
                        item.habitatId = observation.habitatId;
                        item.primaryActivityId = observation.primaryActivityId;
                        item.secondaryActivityId = observation.secondaryActivityId;
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
                saveAndMoveTo('/foraging/step4/');
            };


            $scope.back = function() {
                // need to pass the survey identifier on to step 1
                saveAndMoveTo('/foraging/step2/');
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
            loadAvailableBirds();
            $scope.foragingSurvey = pullFromSession();

            updateBirdSpeciesListFromExistingObservations();

            // Configure shared "bottomBar" components
            $scope.canGoBack = true;
            $scope.canSaveForLater = true;



            $scope.loading = false;
        }
    ]);
