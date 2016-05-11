'use strict';

flnd.birdSpeciesCreate = {
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

    configureSubmit: function(config, $scope, messenger, authService, $uibModalInstance) {
        var $this = this;

        return function() {
            $scope.loading = true;

            $this.updateSurveyTypes($scope.birdspecies);

            authService.post(config.birdspecies, $scope.birdspecies)
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
 * @name flightNodeApp.controller.birdspecies:BirdSpeciesCreateController
 * @description
 * # BirdSpeciesCreateController
 * Controller for the create bird species page.
 */
angular.module('flightNodeApp')
    .controller('BirdSpeciesCreateController', ['$scope', '$http', '$log', '$location', 'messenger', 'authService', 'config', '$uibModalInstance',
        function($scope, $http, $log, $location, messenger, authService, config, $uibModalInstance) {

            if (!(authService.isAdministrator() ||
                    authService.isCoordinator())) {
                $log.warn('not authorized to access this path');
                $location.path('/');
                return;
            }

            $scope.loading = true;

            $scope.cancel = function() {
                $uibModalInstance.dismiss('cancel');
            };

            $scope.submit = flnd.birdSpeciesCreate.configureSubmit(config, $scope, messenger, authService, $uibModalInstance);

            $scope.loading = false;
        }
    ]);
