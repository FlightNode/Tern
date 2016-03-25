'use strict';

flnd.birdSpeciesList = {
    retrieveRecords: function(config, $scope, messenger, authService) {

        $scope.birdSpeciesList = {};

        authService.get(config.birdspeciesBySurveyType)        
            .then(function success(response) {

                $scope.birdSpeciesList = response.data;

            }, function error(response) {

                messenger.displayErrorResponse($scope, response);

            });
    }
};

flnd.censusDataCreate = {
    configureSubmit: function($scope, config, messenger, authService, censusFormService, $location){
        return function(){
            $scope.loading = true;
            
        
            console.log('now what: ' + censusFormService.censusForm.saveForLater);
            console.log('now what: ' + $scope.censusForm.saveForLater);
            //TODO: This function further needs tidying up. Mainly focusing upon upon integration with backend. Once basic flow start to work, will clean it.
            //EX: Instead of manually making PutUrl, need to fetch the Location from header of POST reposnse and then use that as PUT URL.
            if($scope.censusForm.surveyId === undefined) //First time POST
            {                
                authService.post(config.waterbirdForagingSurvey, $scope.censusForm)
                    .then(function success(response){
                            var currentStep = censusFormService.censusForm.step;
                            // console.log('Local URL:' + response.headers('Location'));
                            // console.log('before' + censusFormService.censusForm.saveAndMoveNext);
                            var toMoveNext = censusFormService.censusForm.saveAndMoveNext;
                            var saveForLater = censusFormService.censusForm.saveForLater;
                            //var saveForLater = $scope.saveForLater;
                            console.log("saveForLater:"+saveForLater);
                            //Load the response data from the API back into scope.
                            $scope.censusForm = response.data;
                            $scope.censusForm.PutUrl = config.waterbirdForagingSurvey + response.data.surveyIdentifier
                            $scope.censusForm.step = currentStep;
                            $scope.censusForm.saveForLater = saveForLater;
                            console.log('save for later11: ' + $scope.censusForm.saveForLater); 
                            censusFormService.censusForm = $scope.censusForm;
                            //$scope.saveForLater = true;
                            console.log('save for later: ' + censusFormService.censusForm.saveForLater);

                            if (toMoveNext && censusFormService.censusForm.step === 1){
                                $location.path('/censusdata/create2');                
                            }
                            if (toMoveNext && censusFormService.censusForm.step === 2){
                                $location.path('/censusdata/create3');                
                            }
                        }, function error(response){
                            messenger.displayErrorResponse($scope, response);
                        })
                    .finally(function(){
                        $scope.loading = false;
                    });
            }
            else { //Subsequent updates
                console.log('step value of finish click: ' + $scope.censusForm.step);
                console.log('saveForLater1: ' + $scope.censusForm.saveForLater);
                console.log('saveForLater2: ' + censusFormService.censusForm.saveForLater);
                var saveForLater = censusFormService.censusForm.saveForLater;
                console.log('save for later valuexx: ' + saveForLater);
                var toFinish = censusFormService.censusForm.saveAndFinish;
                if(toFinish){
                    censusFormService.censusForm.step = 4;
                    $scope.censusForm.step = 4;
                }
                var putUrl = config.waterbirdForagingSurvey + $scope.censusForm.surveyIdentifier
                console.log('updated census form object: ' + $scope.censusForm);
                authService.put(putUrl, $scope.censusForm)
                    .then(function success(response){
                            console.log('put method output: ' + response);
                            var currentStep = censusFormService.censusForm.step;
                            var toMoveNext = censusFormService.censusForm.saveAndMoveNext;
                            
                            var saveForLater = censusFormService.censusForm.saveForLater;
                            //var saveForLater = $scope.saveForLater;
                            
                            //var saveForLater = censusFormService.censusForm.saveForLater;
                            //Load the response data from the API back into scope.
                            $scope.censusForm = response.data;
                            $scope.censusForm.step = currentStep;
                            $scope.censusForm.saveForLater = saveForLater;
                            console.log('save for later value: ' + saveForLater);
                            
                            censusFormService.censusForm = $scope.censusForm
                            if (toMoveNext && censusFormService.censusForm.step === 1){
                                $location.path('/censusdata/create2');                
                            }
                            else if (toMoveNext && censusFormService.censusForm.step === 2){
                                $location.path('/censusdata/create3');                
                            }
                            else if (toFinish){
                                $location.path('/censusdata/create4');
                            }
                        }, function error(response){
                            console.log(response);
                            messenger.displayErrorResponse($scope, response);
                        })
                    .finally(function(){
                        $scope.loading = false;
                    });
            }             
        };
    }
};

/**
 * @ngdoc function
 * @name flightNodeApp.controller:CensusDataCreateController
 * @description
 * # CensusDataCreateController
 * Controller for the create census form.
 */
angular.module('flightNodeApp')
    .controller('CensusDataCreateController', 
    ['$scope', 'authService', 'config', 'messenger', 'censusFormService','$filter','$location',
    function ($scope, authService, config, messenger, censusFormService, $filter, $location) {
		$scope.loading = true;
        $scope.saveForLater=false;
        $scope.data = {};
        
        flnd.birdSpeciesList.retrieveRecords(config, $scope, messenger, authService);
        flnd.locationList.retrieveRecords(config, $scope, messenger, authService);
// 
//         //main payload which will be delivered to api for persistence.
//         $scope.censusForm = censusFormService.censusForm;
        
        //Lookup data coming from hard coded arrays.
        $scope.data.tideInfo = censusFormService.tideInfo;         
        $scope.data.weatherInfo = censusFormService.weatherInfo;
        $scope.data.vantagePointInfo = censusFormService.vantagePointInfo;
        $scope.data.accessPointInfo = censusFormService.accessPointInfo;
        $scope.data.siteTypeInfo = censusFormService.siteTypeInfo;        
        $scope.data.feedingRateInfo = censusFormService.feedingRateInfo;
        $scope.data.habitatInfo = censusFormService.habitatInfo;
        $scope.data.behaviorTypeInfo = censusFormService.behaviorTypeInfo;
        $scope.data.disturbanceTypeInfo = censusFormService.disturbanceTypeInfo;
        
        //Method to set the birdSpeciesId from the UI.
        $scope.setBirdId = function(index, birdSpeciesId){
            censusFormService.censusForm.observations[index].birdSpeciesId = birdSpeciesId;
        };
        
        //Method to set the disturbanceTypeId from the UI.
        $scope.setDisturbanceTypeId = function(index, disturbanceTypeId){
            censusFormService.censusForm.disturbances[index].disturbanceTypeId = disturbanceTypeId;
        };
        
        // //Method to mark the final step on click of Finish from the UI.
        // $scope.markAsFinalStep = function(){
        //     console.log('before changing value: ' + $scope.censusForm.step);
        //     console.log('before changing value: ' + censusFormService.censusForm.step);
        //     censusFormService.censusForm.step = 4;
        //     $scope.censusForm.step = 4;
        //     console.log('after changing value: ' + $scope.censusForm.step);
        //     console.log('after changing value: ' + censusFormService.censusForm.step);
        // };
        
      //  censusFormService.censusForm.saveForLater = $scope.saveForLater;
        
        //main payload which will be delivered to api for persistence.
        $scope.censusForm = censusFormService.censusForm;
        
        $scope.submit = flnd.censusDataCreate.configureSubmit($scope, config, messenger, authService, censusFormService, $location);
        
        // $scope.submitAndMoveNext = function(){
        //     flnd.censusDataCreate.configureSubmit($scope, config, messenger, authService, censusFormService);
        //     
        //     if (censusFormService.censusForm.step==1){            
        //         $location.path('/censusdata/create2');                
        //     }
        //     if (censusFormService.censusForm.step==2){            
        //         $location.path('/censusdata/create3');                
        //     }
        //     ///console.log("button clicked;");          
        //     
        // };
        
        $scope.loading = false;
  }]);