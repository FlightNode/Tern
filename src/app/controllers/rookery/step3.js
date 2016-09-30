'use strict';

/**
 * @ngdoc function
 * @name flightNodeApp.controller:RookeryCensusStep3Controller
 * @description
 * # RookeryCensusStep3Controller
 * Controller for rookery census form, step 3.
 */
angular.module('flightNodeApp')
    .controller('RookeryCensusStep3Controller', ['$scope', 'authService', 'config', 'messenger',
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
            var allBirdsKey = "allBirds";

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

            var loadNumberOfadultsForDropDown = function() {
                $scope.numberOfAdults = [
                    { value: 0, text: 'None' },
                    { value: 1, text: 'Less than 25' },
                    { value: 2, text: '25 to 200' },
                    { value: 3, text: 'More than 200' }
                ];
            }

            var loadAvailableBirds = function() {

                birdsProxy.getRookeryBirds($scope, function(data) {

                    // Change it to a dictionary and load into scope
                    $scope.birdSpeciesList = _.keyBy(data, function(o) {
                        return o.id;
                    });

                    mapActualObservationsIntoBirdSpeciesList();
                });
            };

            var mapActualObservationsIntoBirdSpeciesList = function() {
                if ($scope.rookeryCensus.observations &&
                    $scope.rookeryCensus.observations.length > 0) {

                    _.each($scope.rookeryCensus.observations, function(observation) {

                        var item = $scope.birdSpeciesList[observation.birdSpeciesId];

                        if (item) {
                            item.observationId = observation.observationId;
                            item.adults = observation.adults;
                            item.nestsPresent = observation.nestsPresent;
                            item.chicksPresent = observation.chicksPresent;
                            item.fledglingsPresent = observation.fledglingsPresent;
                        }
                    });
                }
            };

            var syncBirdSpeciesListIntoRookeryCensusSurvey = function() {
                // Because the bird species form is bound to $scope.birdSpeciesList, instead
                // of $scope.rookeryCensus.observations, we now need to replace the observations
                // array with the contents of the birdSpeciesList

                $scope.rookeryCensus.observations =
                    _($scope.birdSpeciesList).omitBy(function(item) {
                        // strip out species with no adults
                        return (item.adults === undefined || item.adults === 0);
                    })
                    .values() // extract the dictionary values without the keys
                    .map(function(item) { // convert to the expect data model
                        return {
                            observationId: item.observationId,
                            birdSpeciesId: item.id,
                            adults: item.adults,
                            nestsPresent: item.nestsPresent,
                            chicksPresent: item.chicksPresent,
                            fledglingsPresent: item.fledglingsPresent,
                        };
                    })
                    .value(); // resolve the method chain
            };


            var saveAndMoveTo = function(nextPath) {
                $scope.loading = true;

                syncBirdSpeciesListIntoRookeryCensusSurvey();

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
                saveAndMoveTo('/rookery/step4/');
            };


            $scope.back = function() {
                // need to pass the survey identifier on to step 1
                saveAndMoveTo('/rookery/step2/');
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


            $scope.rookeryCensus = pullFromSession();
            $scope.locationName = pullFromSession(locationNameKey).locationName;

            loadEnums();
            loadAvailableBirds();
            loadNumberOfadultsForDropDown();


            // TODO: restore validations

            $scope.step = 3;

            // Configure shared "bottomBar" components
            $scope.canGoBack = true;
            $scope.canSaveForLater = true;

            $scope.loading = false;
        }
    ]);
