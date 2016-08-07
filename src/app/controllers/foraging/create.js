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
        '$route', '$uibModal', 'birdsProxy',
        function($scope, authService, config, messenger,
            foragingSurveyProxy, $filter, $location, $log, locationProxy, enumsProxy,
            $route, $uibModal, birdsProxy) {


            if (!(authService.isReporter())) {
                $log.warn('not authorized to access this path');
                $location.path('/');
                return;
            }

            $scope.loading = true;

            var modelKey = 'foragingSurvey';
            var observationsModelKey = 'observations';
            var enumsKey = 'enums';
            var birdsKey = 'birdSpeciesList';
            var locationsKey = 'locations';
            var disturbanceKey = 'disturbances';


            // Setup date and time controls
            $scope.startDateOpened = false;
            $scope.datePickerOptions = {
                formatYear: 'yy',
                formatMonth: 'MM',
                maxMode: 'day',
                maxDate: new Date(2021, 1, 1),
                minDate: new Date(1990, 1, 1),
                startingDay: 1
            };
            $scope.datePickerModelOptions = {
                allowInvalid: true
            };
            $scope.showDatePicker = function() {
                $scope.startDateOpened = !$scope.startDateOpened;
            };
            $scope.updateStartDate = function() {
                $scope.foragingSurvey.startDate = new Date($scope.foragingSurvey.startDateManual);
            };
            $scope.updateStartDateManual = function() {
                $scope.foragingSurvey.startDateManual = $filter('date')($scope.foragingSurvey.startDate, 'MM/dd/yyyy');
            };
            $scope.hstep = 1;
            $scope.mstep = 1;


            var saveToSession = function(key, data) {
                sessionStorage.setItem(key, JSON.stringify(data));
            };

            var pullFromSession = function(key) {
                var stored = sessionStorage.getItem(key);
                stored = stored === "undefined" ? undefined : stored;
                if (stored) {
                    return JSON.parse(stored || {});
                }
                return null;
            };

            var pullModelFromSession = function() {
                var model = pullFromSession(modelKey) || {};

                // need to convert to a a real Date object to support timepicker
                var format = 'YYYY-MM-DD hh:mm a';
                if (model.startTime && model.startTime.includes('M')) {
                    model.startTime = moment('1970-01-01 ' + model.startTime, format).toDate();
                }
                if (model.endTime && model.endTime.includes('M')) {
                    model.endTime = moment('1970-01-01 ' + model.endTime, format).toDate();
                }

                model.startDateManual = model.startDate;
                // The date in session depends on how it came back from the server after a save
                var temp = moment(model.startDate, 'MM/DD/YYYY');
                if (!temp.isValid()) {
                    temp = moment(model.startDate);
                }
                model.startDate = temp.toDate();

                return model;
            };

            // Prepare data - first try pulling from sessionStorage if available
            $scope.foragingSurvey = pullModelFromSession(modelKey);
            if (!$scope.foragingSurvey) {
                var begin = moment('1970-01-01 00:00:00.000').toDate();
                $scope.foragingSurvey = {
                    observations: [],
                    disturbances: [],
                    startTime: begin,
                    endTime: begin
                };
            }

            $scope.enums = pullFromSession(enumsKey);
            if (!$scope.enums) {
                enumsProxy.getForForagingSurvey($scope, function(data) {
                    $scope.enums = data;
                    saveToSession(enumsKey, data);
                });
            }

            $scope.locations = pullFromSession(locationsKey);
            if (!$scope.locations) {
                locationProxy.get($scope, function(data) {
                    $scope.locations = data;
                    saveToSession(locationsKey, data);
                });
            }


            var step = $route.current.step;
            $scope.step = step;
            $scope.canGoBack = (step > 1);
            $scope.canSaveForLater = (step < 5);

            // Load up the bird species list
            $scope.birdSpeciesList = pullFromSession(observationsModelKey);
            if (step === 3) {
                if (!$scope.birdSpeciesList || $scope.birdSpeciesList.length === 0) {
                    // This means we haven't visited step 3 yet. 

                    // First, get the raw species list 
                    var birdSpeciesList = pullFromSession(birdsKey);
                    if (!birdSpeciesList || birdSpeciesList.length === 0) {
                        // We haven't yet loaded it into session storage, so
                        // retrieve from the API

                        birdsProxy.getForagingBirds($scope, function(data) {
                            birdSpeciesList = data;
                            saveToSession(birdsKey, birdSpeciesList);
                        });
                    }

                    // Now that we have a list, change it to a dictionary and load into scope
                    $scope.birdSpeciesList = _.keyBy(birdSpeciesList, function(o) {
                        return o.id;
                    });
                    birdSpeciesList = null;
                }
            }

            // Load up the disturbances
            $scope.disturbances = pullFromSession(disturbanceKey);
            if (step === 4) {
                if (!$scope.disturbances || $scope.disturbances.length === 0) {
                    // This means we haven't visited step 4 yet. But we now
                    // that we already have the disturbanceTypeInfo enum

                    $scope.disturbances = _.keyBy($scope.enums.disturbanceTypeInfo, function(dt) {
                        return dt.id;
                    });
                }
            }

            // The next set code & functions are used in the summary page
            if (step === 5) {
                var m = $scope.foragingSurvey;
                $scope.reviewInvalid = !(
                    m.siteTypeId &&
                    m.temperature &&
                    m.windSpeed &&
                    m.tideId &&
                    m.weatherId &&
                    m.observers &&
                    m.vantagePointId &&
                    m.accessPointId
                );
            } else {
                $scope.reviewInvalid = false;
            }

            $scope.getLocationName = function() {
                var id = $scope.foragingSurvey.locationId;
                var location = _.find($scope.locations, { id: id });
                return location.siteCode + ' - ' + location.siteName;
            };
            $scope.getSiteType = function() {
                var id = +$scope.foragingSurvey.siteTypeId;
                var siteType = _.find($scope.enums.siteTypeInfo, { id: id });
                if (siteType) {
                    return siteType.description;
                } else {
                    return '';
                }
            };
            $scope.getTide = function() {
                var id = +$scope.foragingSurvey.tideId;
                var tide = _.find($scope.enums.tideInfo, { id: id });
                if (tide) {
                    return tide.description;
                } else {
                    return '';
                }
            };
            $scope.getWeather = function() {
                var id = +$scope.foragingSurvey.weatherId;
                var weather = _.find($scope.enums.weatherInfo, { id: id });
                if (weather) {
                    return weather.description;
                } else {
                    return '';
                }
            };
            $scope.getVantagePoint = function() {
                var id = +$scope.foragingSurvey.vantagePointId;
                var vantagePoint = _.find($scope.enums.vantagePointInfo, { id: id });
                if (vantagePoint) {
                    return vantagePoint.description;
                } else {
                    return '';
                }
            };
            $scope.getAccessPoint = function() {
                var id = +$scope.foragingSurvey.accessPointId;
                var accessPoint = _.find($scope.enums.accessPointInfo, { id: id });
                if (accessPoint) {
                    return accessPoint.description;
                } else {
                    return '';
                }
            };
            $scope.getCommonName = function(id) {
                return _.find($scope.birdSpeciesList, { id: id }).commonName;
            };
            $scope.getActivity = function(id) {
                return _.find($scope.enums.behaviorTypeInfo, { id: +id }).description;
            };
            $scope.getHabitat = function(id) {
                return _.find($scope.enums.habitatInfo, { id: +id }).description;
            };
            $scope.getFeeding = function(id) {
                return _.find($scope.enums.feedingRateInfo, { id: +id }).description;
            };
            $scope.getDisturbance = function(id) {
                return _.find($scope.enums.disturbanceTypeInfo, { id: +id }).description;
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



            $scope.validateDisturbance = function(disturbanceId) {
                var disturbance = $scope.disturbances[disturbanceId];

                disturbance.invalid = (
                    // when any column is set
                    (disturbance.quantity > 0 || disturbance.durationMinutes > 0 || disturbance.behavior) &&
                    // then all of them are needed
                    !(disturbance.quantity > 0 && disturbance.durationMinutes > 0 && disturbance.behavior)
                );

                $scope.invalid = _.some($scope.foragingSurvey.disturbances, 'invalid');
            };




            var saveModelToSesion = function(data) {

                // Load new observation id values into the temporary species 
                // list and load that into session
                _(data.observations).each(function(item) {
                    $scope.birdSpeciesList[item.birdSpeciesId.toString()].observationId = item.observationId;
                });
                saveToSession(observationsModelKey, $scope.birdSpeciesList);

                // Load the new disturbance id values into the temporary
                // disturbances list and load that into session
                _(data.disturbances).each(function(item) {
                    $scope.disturbances[item.disturbanceTypeId.toString()].disturbanceId = item.disturbanceId;
                });
                saveToSession(disturbanceKey, $scope.disturbances);

                saveToSession(modelKey, data);
            };

            $scope.save = function(next) {
                next = next || function() {}; // because this can be called directly without a callback

                $scope.loading = true;

                var model = $scope.foragingSurvey;

                model.observations = _($scope.birdSpeciesList)
                    .omitBy(function(item) { // strip out species with no adults and no juveniles
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

                model.disturbances = _($scope.disturbances)
                    .omitBy(function(item) {
                        return item.quantity === undefined;
                    })
                    .values()
                    .map(function(item) {
                        return {
                            disturbanceId: item.disturbanceId,
                            disturbanceTypeId: item.id,
                            quantity: item.quantity,
                            durationMinutes: item.durationMinutes,
                            behavior: item.behavior
                        };
                    })
                    .value();


                if (model.surveyIdentifier) {
                    foragingSurveyProxy.update($scope, model, function(data) {
                        // save the modified model to session for the next page
                        saveModelToSesion(data);

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
                var finished = $scope.foragingSurvey.finished = (step === 5);

                $scope.save(function() {
                    if (finished) {
                        // Flush the session
                        saveToSession(observationsModelKey, null);
                        saveToSession(modelKey, null);

                        $location.path('/foraging/complete');
                    } else {
                        $location.path('/foraging/create' + (step + 1).toString());
                    }
                });
            };


            $scope.back = function() {
                $scope.save(function() {
                    $location.path('/foraging/create' + (step - 1).toString());
                });
            };

            $scope.reset = function() {
                var modal = $uibModal.open({
                    animation: true,
                    templateUrl: '/app/views/confirmResetForm.html',
                    backdrop: true,
                    size: 'sm'
                });
                modal.result.then(function success() {
                    saveToSession(observationsModelKey, null);
                    saveToSession(modelKey, null);

                    $location.path('/foraging');
                }, function dismissed() {
                    // do nothing
                });
            };


            birdsProxy.getAll($scope, function(data) {
                $scope.allBirds = _.map(data, function(item) {
                    return {
                        commonName: item.commonName,
                        commonAlphaCode: item.commonAlphaCode,
                        speciesId: item.id
                    };
                });
            });

            $scope.addSpecies = function() {
                var newBird = _.find($scope.allBirds, { commonName: $scope.speciesToAdd });

                if (newBird) {
                    $scope.birdSpeciesList[newBird.speciesId] = {
                        commonName: newBird.commonName,
                        id: newBird.id
                    };

                    $scope.speciesToAdd = '';
                }
            };

            $scope.loading = false;
        }
    ]);
