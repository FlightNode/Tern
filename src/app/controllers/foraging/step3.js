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
        '$route', '$uibModal', 'birdsProxy',
        function($scope, authService, config, messenger,
            foragingSurveyProxy, $filter, $location, $log, locationProxy, enumsProxy,
            $route, $uibModal, birdsProxy) {


            if (!(authService.isAuthorized())) {
                $log.warn('not authorized to access this path');
                $location.path('/');
                return;
            }

            //
            // Helper functions
            //
            var modelKey = 'foragingSurveyModel';
            var locationNameKey = 'locationName';
            var allBirdsKey = 'allBirds';

            var saveToSession = function(data, key) {
                key = key || modelKey;
                sessionStorage.setItem(key, JSON.stringify(data));
            };

            var pullFromSession = function(key) {
                key = key || modelKey;
                var stored = sessionStorage.getItem(key);
                stored = stored === 'undefined' ? undefined : stored;
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

                        if (item) {
                            item.observationId = observation.observationId;
                            item.adults = observation.adults;
                            item.juveniles = observation.juveniles;
                            item.feedingId = observation.feedingId;
                            item.habitatId = observation.habitatId;
                            item.primaryActivityId = observation.primaryActivityId;
                            item.secondaryActivityId = observation.secondaryActivityId;
                        } else {
                            // This observation is from a species manually added to the species list
                            var extra = _.find($scope.allBirds, { speciesId: observation.birdSpeciesId });

                            $scope.birdSpeciesList[observation.birdSpeciesId] = {
                                observationId: observation.observationId,
                                id: observation.birdSpeciesId,
                                adults: observation.adults,
                                juveniles: observation.juveniles,
                                feedingId: observation.feedingId,
                                habitatId: observation.habitatId,
                                primaryActivityId: observation.primaryActivityId,
                                secondaryActivityId: observation.secondaryActivityId,
                                commonName: extra.commonName
                            };
                        }
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
                        return (item.adults === undefined && item.juveniles === undefined) ||
                            (item.adults === 0 && item.juveniles === 0);
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

            $scope.validateObservation = function(birdSpeciesId) {
                var observation = $scope.birdSpeciesList[birdSpeciesId];

                // if either adults or juveniles is nonzero, then the other fields *must* be filled in
                observation.invalid = (
                    (observation.adults > 0 ||
                        observation.juveniles > 0) &&
                    (observation.primaryActivityId === undefined ||
                        observation.secondaryActivityId === undefined ||
                        observation.habitatId === undefined ||
                        observation.feedingId === undefined)
                ) || observation.adults < 0 || observation.juveniles < 0;

                // If *any* observations are invalid, then the form is invalid
                $scope.invalid = _.some($scope.birdSpeciesList, 'invalid');
            };

            var getAllBirds = function(next) {
                $scope.allBirds = pullFromSession(allBirdsKey);

                if (!$scope.allBirds) {
                    birdsProxy.getAll($scope, function(data) {
                        $scope.allBirds = _.map(data, function(item) {
                            return {
                                commonName: item.commonName,
                                commonAlphaCode: item.commonAlphaCode,
                                speciesId: item.id
                            };
                        });

                        saveToSession($scope.allBirds, allBirdsKey);

                        next();
                    });
                } else {
                    next();
                }
            };

            //
            // Configure button actions
            //

            $scope.addSpecies = function() {
                var newBird = _.find($scope.allBirds, { commonName: $scope.speciesToAdd });

                if (newBird) {
                    // Load this bird into the visible list
                    $scope.birdSpeciesList[newBird.speciesId] = {
                        commonName: newBird.commonName,
                        id: newBird.speciesId
                    };

                    $scope.speciesToAdd = '';
                }
            };

            $scope.save = function() {
               $scope.loading = true;

                foragingSurveyProxy.update($scope, $scope.foragingSurvey, function() {
                    $scope.loading = false;
                });
            };

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
            getAllBirds(loadAvailableBirds);


            // TODO: restore validations

            $scope.step = 3;

            // Configure shared 'bottomBar' components
            $scope.canGoBack = true;
            $scope.canSaveForLater = true;

            $scope.loading = false;
        }
    ]);
