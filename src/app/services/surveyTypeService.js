'use strict';

/**
 * @ngdoc function
 * @name flightNodeApp.services:surveyTypeService
 * @description
 * # surveyTypeService
 * Service for information about survey types
 */
angular.module('surveyTypeService', [])
    .factory('surveyTypeService',
        ['$log', 'authService', 'config',
         function ($log, authService, config) {

            return {

                getAll: function() {

                    var url = config.surveyTypes;

                    return authService.get(url)
                }   

            }
      }
  ]
);