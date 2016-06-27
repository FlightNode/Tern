(function() {
    'use strict';
    /**
     *  @ngdoc overview
     *  @name loading
     *
     *  @description
     *
     *  #loading
     *
     *  This module provides a "loading" gif
     */
    angular.module('flightNodeApp')
        .directive('loading', [function() {
            return {
                restrict: 'E',
                replace: true,
                template: '<div class="loading" ng-show="loading"><img class="loadingImage" src="http://www.nasa.gov/multimedia/videogallery/ajax-loader.gif" width="64" height="64" /></div>',
                link: function(scope) {
                    scope.$watch('loading', function(val) {
                        if (val) {
                            scope.loading = true;
                        } else {
                            scope.loading = false;
                        }
                    });
                }
            };
        }]);
})();
