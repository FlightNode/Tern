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

            var loadAvailableBirds = function() {
                // TODO: reconsider caching locally

                birdsProxy.getForagingBirds($scope, function(data) {

                    // Change it to a dictionary and load into scope
                    $scope.birdSpeciesList = _.keyBy(data, function(o) {
                        return o.id;
                    });

                    mapActualObservationsIntoBirdSpeciesList();
                });
            };

            var mapActualObservationsIntoBirdSpeciesList = function() {
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

            var syncBirdSpeciesListIntoForagingSurvey = function() {
                // Because the bird species form is bound to $scope.birdSpeciesList, instead
                // of $scope.foragingSurvey.observations, we now need to replace the observations
                // array with the contents of the birdSpeciesList

                $scope.foragingSurvey.observations =
                    _($scope.birdSpeciesList).omitBy(function(item) {
                        // strip out species with no adults and no juveniles
                        return item.adults === undefined && item.juveniles === undefined;
                    })
                    .values() // extract the dictionary values without the keys
                    .map(function(item) { // convert to the expect data model
                        return {
                            observationId: item.observationId,
                            birdSpeciesId: item.id,
                            adults: item.adults,
                            juveniles: item.juveniles,
                            feedingId: item.feedingId,
                            habitatId: item.habitatId,
                            primaryActivityId: item.primaryActivityId,
                            secondaryActivityId: item.secondaryActivityId,
                        };
                    })
                    .value(); // resolve the method chain
            };


            var saveAndMoveTo = function(nextPath) {
                $scope.loading = true;

                syncBirdSpeciesListIntoForagingSurvey();

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
            $scope.loading = true;


            $scope.foragingSurvey = pullFromSession();
            $scope.locationName = pullFromSession(locationNameKey).locationName;

            loadEnums();
            loadAvailableBirds();


            // TODO: restore validations

            $scope.step = 3;

            // Configure shared "bottomBar" components
            $scope.canGoBack = true;
            $scope.canSaveForLater = true;

            $scope.loading = false;
        }
    ]);
