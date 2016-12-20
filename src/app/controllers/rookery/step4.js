'use strict';

/**
 * @ngdoc function
 * @name flightNodeApp.controller:RookeryCensusStep4Controller
 * @description
 * # RookeryCensusStep4Controller
 * Controller for rookery foraging form, step 4 (disturbances).
 */
angular.module('flightNodeApp')
    .controller('RookeryCensusStep4Controller', ['$scope', 'authService', 'config', 'messenger',
        'rookeryCensusProxy', '$filter', '$location', '$log', 'locationProxy', 'enumsProxy',
        '$route', '$uibModal',
        function($scope, authService, config, messenger,
            rookeryCensusProxy, $filter, $location, $log, locationProxy, enumsProxy,
            $route, $uibModal) {


            if (!(authService.isAuthorized())) {
                $log.warn('not authorized to access this path');
                $location.path('/');
                return;
            }

            //
            // Helper functions
            //
            var modelKey = 'rookeryCensusModel';
            var locationNameKey = 'locationName';

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

            var prepareDisturbances = function() {

                // The view binds to an altered form of disturbances - create that from enums
                $scope.disturbances = _.keyBy($scope.enums.disturbanceTypeInfo, function(dt) {
                    return dt.id;
                });

                // Load previously recorded disturbance data from the survey
                // into scope
                _.each($scope.rookeryCensus.disturbances, function(disturbed) {

                    var item = $scope.disturbances[disturbed.disturbanceTypeId];

                    item.quantity = disturbed.quantity;
                    item.durationMinutes = disturbed.durationMinutes;
                    item.behavior = disturbed.behavior;
                });
            };


            var loadEnums = function(next) {
                // TODO: look into caching this cleanly
                if (!$scope.enums) {
                    enumsProxy.getForForagingSurvey($scope, function(data) {
                        $scope.enums = data;

                        next();
                    });
                }
            };

            var syncDisturbancesIntoRookeryCensusSurvey = function() {
                // Because the disturbance form is bound to $scope.disturbances, instead
                // of $scope.rookeryCensus.disturbances, we now need to replace the disturbances
                // array with the contents from the $scope
                $scope.rookeryCensus.disturbances = _($scope.disturbances)
                    .omitBy(function(item) {
                        // ignore entries with no data
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
            };

            var saveAndMoveTo = function(nextPath) {
                $scope.loading = true;

                syncDisturbancesIntoRookeryCensusSurvey();

                rookeryCensusProxy.update($scope, $scope.rookeryCensus, function(data) {

                    saveToSession(data);

                    $scope.loading = false;

                    $location.path(nextPath + data.surveyIdentifier);
                });
            };


            $scope.validateDisturbance = function(disturbanceId) {
                var disturbance = $scope.disturbances[disturbanceId];

                disturbance.invalid = (
                    // when any column is set
                    (disturbance.quantity > 0 || disturbance.durationMinutes > 0 || disturbance.behavior) &&
                    // then all of them are needed
                    !(disturbance.quantity > 0 && disturbance.durationMinutes > 0 && disturbance.behavior)
                );

                $scope.invalid = _.some($scope.disturbances, 'invalid');
            };

            //
            // Configure button actions
            //

            $scope.save = function(){ 
                $scope.loading = true;

                rookeryCensusProxy.update($scope, $scope.rookeryCensus, function(data) {
                    $scope.rookeryCensus = data;
                    $scope.loading = false;
                });
            };
            $scope.next = function() {
                // need to pass the survey identifier on to step 3
                saveAndMoveTo('/rookery/step5/');
            };


            $scope.back = function() {
                // need to pass the survey identifier on to step 1
                saveAndMoveTo('/rookery/step3/');
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

            // TODO
            // These two items must be in this order for now
            $scope.rookeryCensus = pullFromSession();
            $scope.locationName = pullFromSession(locationNameKey).locationName;
            loadEnums(prepareDisturbances);


            $scope.step = 4;

            // Configure shared "bottomBar" components
            $scope.canGoBack = true;
            $scope.canSaveForLater = true;

            $scope.loading = false;
        }
    ]);
