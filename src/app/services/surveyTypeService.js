'use strict';

/**
 * @ngdoc function
 * @name flightNodeApp.services:surveyTypeService
 * @description
 * # surveyTypeService
 * Service for information about survey types
 */
angular.module('surveyTypeService', [])
    .factory('authService',
        ['$log', 'authService', '$configService',
         function ($log, authService, configService) {

         	return {

         		getAll: function() {

         			var url = configService.surveyTypes;

         			authService.get(url)
         			.then(function success(response){

         				// todo

         			}, function error(response) {

						//todo

         			});

         		}	

         	}
      }
  ]
);