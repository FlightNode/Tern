'use strict';

flnd.birdSpeciesEdit = {

    updateSurveyTypes: function(birdspecies) {
        // This hard-coding is nasty but useful due to time constraints
        birdspecies.surveyTypeNames = [];
        if (birdspecies.surveyTypeRookery) {
            birdspecies.surveyTypeNames.push('TERN Rookery Survey');
        }
        if (birdspecies.surveyTypeForaging) {
            birdspecies.surveyTypeNames.push('TERN Waterbird Foraging Survey');
        }
    },

    configureSubmit: function(id, config, $scope, messenger, authService, $uibModalInstance) {
        var $this = this;

        return function() {
            $scope.loading = true;

            $this.updateSurveyTypes($scope.birdspecies);

            var url = config.birdspecies + id;
            authService.put(url, $scope.birdspecies)
                .then(function success() {

                    $uibModalInstance.close();

                }, function error(response) {
                    messenger.displayErrorResponse($scope, response);
                })
                .finally(function() {
                    $scope.loading = false;
                });
        };
    }
};

/**
 * @ngdoc function
 * @name flightNodeApp.controller.worktype:BirdSpeciesEditController
 * @description
 * # BirdSpeciesEditController
 * Controller for the edit bird species page.
 */
angular.module('flightNodeApp')
    .controller('BirdSpeciesEditController', ['$scope', '$http', '$log', '$location', 'messenger', 'authService', '$routeParams',
        'config', '$uibModalInstance', 'id', 'birdsProxy',
        function($scope, $http, $log, $location, messenger, authService, $routeParams,
            config, $uibModalInstance, id, birdsProxy) {



            if (!authService.isAdministrator()) {
                $log.warn('not authorized to access this path');
                $location.path('/');
                return;
            }

            var setCurrentSurveyTypes = function(birdspecies, $log) {
                // var _ = window._;
                $log.info(birdspecies.surveyTypeNames);

                // This hard-coding is nasty but useful due to time constraints
                if (_.includes(birdspecies.surveyTypeNames, 'TERN Rookery Survey')) {
                    birdspecies.surveyTypeRookery = true;
                } else {
                    birdspecies.surveyTypeRookery = false;
                }
                if (_.includes(birdspecies.surveyTypeNames, 'TERN Waterbird Foraging Survey')) {
                    birdspecies.surveyTypeForaging = true;
                } else {
                    birdspecies.surveyTypeForaging = false;
                }
            };

            $scope.loading = true;

            if (!isFinite(id)) {
                // garbage input
                return;
            }


            birdsProxy.get($scope, id, function(data) {
                setCurrentSurveyTypes(data, $log);

                $scope.birdspecies = data;
            });

            $scope.cancel = function() {
                $uibModalInstance.dismiss('cancel');
            };

            $scope.submit = flnd.birdSpeciesEdit.configureSubmit(id, config, $scope, messenger, authService, $uibModalInstance);

            $scope.loading = false;

        }
    ]);
