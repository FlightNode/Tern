'use strict';

/**
 * @ngdoc function
 * @name flightNodeApp.controller:ForagingCreateController
 * @description
 * # ForagingCreateController
 * Controller for the create census form.
 */
angular.module('flightNodeApp')
    .controller('ForagingCreateController', ['$scope', 'authService', 'config', 'messenger',
        'foragingSurveyProxy', '$filter', '$location', '$log', 'locationProxy', 'enumsProxy',
        '$route', '$uibModal',
        function($scope, authService, config, messenger,
            foragingSurveyProxy, $filter, $location, $log, locationProxy, enumsProxy,
            $route, $uibModal) {
            $scope.loading = true;

            var modelKey = 'foragingSurvey';
            var enumsKey = 'enums';
            var birdsKey = 'birdSpeciesList';
            var locationsKey = 'locations';

            // Setup datepicker
            $scope.startDateOpened = false;
            $scope.dateOptions = {
                formatYear: 'yy',
                maxDate: new Date(2021, 1, 1),
                minDate: new Date(1990, 1, 1),
                startingDay: 1
            };
            $scope.openStartDate = function() {
                $scope.startDateOpened = true;
                $log.info('open button clicked');
            };



            var saveToSesion = function(key, data) {
                sessionStorage.setItem(key, JSON.stringify(data));
            };

            var pullFromSession = function(key) {
                var stored = sessionStorage.getItem(key);
                if (stored) {
                    return JSON.parse(stored);
                }
                return null;
            };

            // Prepare data - first try pulling from sessionStorage if available
            $scope.foragingSurvey = pullFromSession(modelKey);
            if (!$scope.foragingSurvey) {
                $scope.foragingSurvey = {
                    observations: [],
                    disturbances: []
                };
            }

            $scope.enums = pullFromSession(enumsKey);
            if (!$scope.enums) {
                enumsProxy.getForForagingSurvey($scope, function(data) {
                    $scope.enums = data;
                    saveToSesion(enumsKey, data);
                });
            }

            $scope.locations = pullFromSession(locationsKey);
            if (!$scope.locations) {
                locationProxy.get($scope, function(data) {
                    $scope.locations = data;
                    saveToSesion(locationsKey, data);
                });
            }


            var step = $route.current.step;
            $scope.canGoBack = (step > 1);
            $scope.canSaveForLater = (step < 4);

            if (step === 2) {
                $scope.birdSpeciesList = pullFromSession(birdsKey);
                if (!$scope.birdSpeciesList) {

                    // TODO: pull this into bird proxy with getBySurveyTypeId(id)
                    authService.get(config.birdspecies + '?surveyTypeId=2')
                        .then(function success(response) {

                            $scope.birdSpeciesList = response.data;
                            saveToSesion(birdsKey, $scope.birdSpeciesList);

                        }, function error(response) {

                            messenger.displayErrorResponse($scope, response);

                        });
                }
            }

            //Method to set the birdSpeciesId from the UI.
            $scope.setBirdId = function(index, birdSpeciesId) {
                var observation = $scope.foragingSurvey.observations[index];
                observation.birdSpeciesId = birdSpeciesId;
                observation.invalid = (
                    (observation.adults > 0 ||
                        observation.juveniles > 0) &&
                    (observation.primaryActivityId === undefined ||
                        observation.secondaryActivityId === undefined ||
                        observation.habitatId === undefined ||
                        observation.feedingId === undefined)
                ) || observation.adults < 0 || observation.juveniles < 0;


                $scope.observationForm.invalid = _.some($scope.foragingSurvey.observations, 'invalid');
            };

            //Method to set the disturbanceTypeId from the UI.
            $scope.setDisturbanceTypeId = function(index, disturbanceTypeId) {
                var disturbance = $scope.foragingSurvey.disturbances[index];
                disturbance.disturbanceTypeId = disturbanceTypeId;
                disturbance.invalid = (
                    // when any column is set
                    (disturbance.quantity > 0 || disturbance.durationMinutes > 0 || disturbance.behavior)
                    // then all of them are needed
                    && !(disturbance.quantity > 0 && disturbance.durationMinutes > 0 && disturbance.behavior)
                );

                $scope.disturbanceForm.invalid = _.some($scope.foragingSurvey.disturbances, 'invalid');
            };


            var saveModelToSesion = function(data) {
                saveToSesion(modelKey, data);
            };

            $scope.save = function(next) {
                next = next || function() {}; // because this can be called directly without a callback

                $scope.loading = true;

                var model = $scope.foragingSurvey;
                $log.info('saving at step ', step);
                $log.info(model);


                if (model.surveyIdentifier) {
                    foragingSurveyProxy.update($scope, model, function() {
                        // save the original model to session for the next page
                        saveModelToSesion(model);

                        $scope.loading = false;

                        next();
                    });
                } else {
                    foragingSurveyProxy.create($scope, model, function(data) {
                        // save the modified model to session for the next page
                        saveModelToSesion(data);

                        $scope.loading = false;

                        next();
                    });
                }
            };

            $scope.next = function() {
                var finished = $scope.foragingSurvey.finished = (step === 4);

                $scope.save(function() {
                    if (finished) {
                        // this is the last step. Here we need to show
                        // the pending survey results. This next() function
                        // is called when the users clicks "Finish".
                        // so we save (which is already done above), but 
                        // need to modify pass a "finished" flag.
                        // 

                        // Flush the session
                        // saveToSesion(modelKey, null);
                    } else {
                        $location.path('/foraging/create' + (step + 1).toString());
                    }
                });
            };


            $scope.back = function() {
                $log.info('back from step, ', step);

                $scope.save(function() {
                    $location.path('/foraging/create' + (step - 1).toString());
                });
            }

            $scope.reset = function() {

                var question = '';


                var modal = $uibModal.open({
                    animation: true,
                    templateUrl: '/app/views/confirmResetForm.html',
                    backdrop: true,
                    size: 'sm'
                });
                modal.result.then(function success() {
                    saveToSesion(modelKey, null);
                    $location.path('/foraging');
                }, function dismissed() {
                    // do nothing
                });
            }

            $scope.loading = false;
        }
    ]);
