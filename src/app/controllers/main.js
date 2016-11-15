'use strict';

/**
 * @ngdoc function
 * @name flightNodeApp.controller:MainController
 * @description
 * # MainController
 * Controller for the default/main page
 */
angular.module('flightNodeApp')
    .controller('MainController', ['$scope', 'NgMap', 'config',
        function($scope, NgMap, config) {
            $scope.loading = true;

            $scope.googleMapsUrl = config.googleMapsUrl;

            NgMap.getMap().then(function(map) {
                $scope.map = map;
            });
            $scope.locations = [
                { id: 1, name: 'Park 1', position: [28.3871, -96.2803] },
                { id: 2, name: 'Park 2', position: [29.3871, -95.2803] }
            ];

            $scope.showDetail = function(e, location) {
                $scope.location = location;
                console.info(location);
                $scope.map.showInfoWindow('foo-iw', location.id);
            };



            $scope.loading = false;
        }
    ]);
