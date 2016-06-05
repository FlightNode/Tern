'use strict';

flnd.censusDataCreate = {
    retrieveBirds: function(config, $scope, messenger, authService) {

        $scope.birdSpeciesList = {};

        authService.get(config.birdspecies + '?surveyTypeId=2')
            .then(function success(response) {

                $scope.birdSpeciesList = response.data;

            }, function error(response) {

                messenger.displayErrorResponse($scope, response);

            });
    },
    configureSubmit: function($scope, config, messenger, authService, foragingSurveyService, $location, $log) {
        return function() {
            $scope.loading = true;
            // var currentStep = function(){
            //         return foragingSurveyService.foragingSurvey.step;
            //     };
            //TODO: This function further needs tidying up. Mainly focusing upon upon integration with backend. Once basic flow start to work, will clean it.
            //EX: Instead of manually making PutUrl, need to fetch the Location from header of POST reposnse and then use that as PUT URL.
            if ($scope.foragingSurvey.surveyId === undefined) //First time POST
            {
                authService.post(config.waterbirdForagingSurvey, $scope.foragingSurvey)
                    .then(function success(response) {
                        var currentStep = foragingSurveyService.foragingSurvey.step;
                        console.log('post');
                        // console.log('Local URL:' + response.headers('Location'));
                        // console.log('before' + foragingSurveyService.foragingSurvey.saveAndMoveNext);
                        var toMoveNext = foragingSurveyService.foragingSurvey.saveAndMoveNext;
                        $scope.foragingSurvey = response.data;
                        $scope.foragingSurvey.PutUrl = config.waterbirdForagingSurvey + response.data.surveyIdentifier;
                        $scope.foragingSurvey.step = currentStep;
                        console.log($scope.foragingSurvey.step);
                        foragingSurveyService.foragingSurvey = $scope.foragingSurvey;
                        $scope.saveForLater = true;

                        if (toMoveNext && foragingSurveyService.foragingSurvey.step === 1) {
                            $location.path('/censusdata/create2');
                        }
                        if (toMoveNext && foragingSurveyService.foragingSurvey.step === 2) {
                            $location.path('/censusdata/create3');
                        }
                    }, function error(response) {
                        messenger.displayErrorResponse($scope, response);
                    })
                    .finally(function() {
                        $scope.loading = false;
                    });
            } else { //Subsequent updates
                console.log('put');
                var putUrl = config.waterbirdForagingSurvey + $scope.foragingSurvey.surveyIdentifier
                console.log('updated census form object: ' + $scope.foragingSurvey);
                authService.put(putUrl, $scope.foragingSurvey)
                    .then(function success(response) {
                        $log.info('put method output: ' + response);
                        var currentStep = foragingSurveyService.foragingSurvey.step;
                        var toMoveNext = foragingSurveyService.foragingSurvey.saveAndMoveNext;

                        var saveForLater = foragingSurveyService.foragingSurvey.saveForLater;
                        //var saveForLater = $scope.saveForLater;

                        //var saveForLater = foragingSurveyService.foragingSurvey.saveForLater;
                        //Load the response data from the API back into scope.
                        $scope.foragingSurvey = response.data;
                        $scope.foragingSurvey.step = currentStep;
                        $scope.foragingSurvey.saveForLater = saveForLater;
                        $log.info('save for later value: ' + saveForLater);

                        foragingSurveyService.foragingSurvey = $scope.foragingSurvey;
                        if (toMoveNext && foragingSurveyService.foragingSurvey.step === 1) {
                            $location.path('/censusdata/create2');
                        } else if (toMoveNext && foragingSurveyService.foragingSurvey.step === 2) {
                            $location.path('/censusdata/create3');
                        } else if (toFinish) {
                            $location.path('/censusdata/create4');
                        }
                    }, function error(response) {
                        $log.info(response);
                        messenger.displayErrorResponse($scope, response);
                    })
                    .finally(function() {
                        $scope.loading = false;
                    });
            }
        };
    }
};

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
        function($scope, authService, config, messenger,
            foragingSurveyProxy, $filter, $location, $log, locationProxy, enumsProxy) {
            $scope.loading = true;

            $scope.saveForLater = false;

            var modelKey = 'foragingSurvey';
            var enumsKey = 'enums';
            var birdsKey = 'birdSpeciesList';
            var locationsKey = 'locations';

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
                    disturbances: [],
                    saveForLater: false,
                    saveAndMoveNext: false,
                    saveAndFinish: false,
                    step: 1
                };
            }

            var step = $scope.foragingSurvey.step;


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

            // don't load until needed in Step 2
            // flnd.censusDataCreate.retrieveBirds(config, $scope, messenger, authService);

            // TODO: these are running for every page, whether needed or not
            // does Angular keep any of this in scope? don't think so.
            // Need to use sessionstorage



            //main payload which will be delivered to api for persistence.


            //Method to set the birdSpeciesId from the UI.
            $scope.setBirdId = function(index, birdSpeciesId) {
                // foragingSurveyService.foragingSurvey.observations[index].birdSpeciesId = birdSpeciesId;
            };

            //Method to set the disturbanceTypeId from the UI.
            $scope.setDisturbanceTypeId = function(index, disturbanceTypeId) {
                // foragingSurveyService.foragingSurvey.disturbances[index].disturbanceTypeId = disturbanceTypeId;
            };

            // //Method to mark the final step on click of Finish from the UI.
            // $scope.markAsFinalStep = function(){
            //     $log.info('before changing value: ' + $scope.foragingSurvey.step);
            //     $log.info('before changing value: ' + foragingSurveyService.foragingSurvey.step);
            //     foragingSurveyService.foragingSurvey.step = 4;
            //     $scope.foragingSurvey.step = 4;
            //     $log.info('after changing value: ' + $scope.foragingSurvey.step);
            //     $log.info('after changing value: ' + foragingSurveyService.foragingSurvey.step);
            // };

            // $scope.submitAndMoveNext = function() {
            //     flnd.censusDataCreate.configureSubmit($scope, config, messenger, authService, foragingSurveyService);

            //     if (foragingSurveyService.foragingSurvey.step == 1) {
            //         $location.path('/censusdata/create2');
            //     }
            //     if (foragingSurveyService.foragingSurvey.step == 2) {
            //         $location.path('/censusdata/create3');
            //     }
            //     ///console.log("button clicked;");          

            // };

            $scope.submit = function(step) {
                var model = $scope.foragingSurvey;

                var saveModelToSesion = function(data) {
                    saveToSesion(modelKey, data);
                };

                switch (step) {
                    case 1:
                        if (model.surveyIdentifier) {
                            foragingSurveyProxy.update($scope, model, function() {
                                // save the original model to session for the next page
                                model.step =2;
                                saveModelToSesion(model);
                                $location.path('/foraging/create2');
                            });
                        } else {
                            foragingSurveyProxy.create($scope, model, function(data) {
                                // save the modified model to session for the next page
                                data.step = 2;
                                saveModelToSesion(data);
                                $location.path('/foraging/create2');
                            });
                        }
                        break;
                    case 2:
                        foragingSurveyProxy.update($scope, model, function() {
                            // save the original model to session for the next page
                            model.step = 3;
                            saveModelToSesion(model);
                            $location.path('/foraging/create3');
                        });
                        break;
                }
            };

            $scope.loading = false;
        }
    ]);

// TODO: need to be able to clear session so that you can start a new survey