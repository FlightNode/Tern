'use strict';

angular.module('censusFormService', [])
    .factory('censusFormService', function(){        
        //Empty global object, acts as container of entire data model
        var censusForm = {};
        // censusForm.surveyIdentifer = ''; //TODO: Load with a GUID that will come from server upon first POST.
        censusForm.observations = [];
        censusForm.disturbances = [];
        censusForm.saveAndMoveNext = false;
        
        //This data could be moved to a json file on disk and loaded back up using http service. But I chose to do it this way for simplicity.
        var tideInfo = [
                { Id: 1, Description: "Water level appears high" },
                { Id: 2, Description: "Water level appears low" },
                { Id: 3, Description: "Wind driven" },
                { Id: 4, Description: "Non-tidal" },      
            ];
        var weatherInfo = [
                { Id: 1, Description: "Clear"},
                { Id: 2, Description: "Partly cloudy"},
                { Id: 3, Description: "Overcast"},
                { Id: 4, Description: "Fog or smoke"},
                { Id: 5, Description: "Drizzle"},
                { Id: 6, Description: "Showers"},
            ];
        var vantagePointInfo = [
                { Id: 1, Description: "On-Site Visit"},
                { Id: 2, Description: "View from adj area by vehicle/boat/on foot"},
            ];
        var accessPointInfo = [
                { Id: 1, Description: "On Foot"},
                { Id: 2, Description: "Vessel (motor)"},
                { Id: 3, Description: "Kayak/ Canoe"}
            ];
        var siteTypeInfo = [
                { Id: 1, Description: "New Colony"},
                { Id: 2, Description: "Surveyed, Inactive"},
                { Id: 3, Description: "Prev. Known Colony (Count only)"},
                { Id: 4, Description: "Surveyed, Active"},
                { Id: 5, Description: "Prev. Known Colony (Count and Description Update)"},
            ];
        var feedingRateInfo = [
                { Id: 1, Description: "Low Success"},
                { Id: 2, Description: "Medium Success"},
                { Id: 3, Description: "High Success"},
            ];
        var habitatInfo = [
                { Id: 1, Description: "Open Water Below Knee"},
                { Id: 2, Description: "Open Water Above Knee"},
                { Id: 3, Description: "Manmade (ditch, culvert, etc..)"},        
                { Id: 4, Description: "Forest"},
                { Id: 5, Description: "Stream"},
                { Id: 6, Description: "Seagrass Beds"},
                { Id: 7, Description: "Low Marsh"},
                { Id: 8, Description: "High Marsh"},
                { Id: 9, Description: "Scrub-Shrub"},
                { Id: 10, Description: "Tall Grass"},
                { Id: 11, Description: "Open Water"},
                { Id: 12, Description: "Beach"},
                { Id: 13, Description: "Mudflat"},
                { Id: 14, Description: "Pond"},
            ];
        var behaviorTypeInfo = [
                {Id: 1, Description: "Feeding"},
                {Id: 2, Description: "Preening"},
                {Id: 3, Description: "Loafing"},
                {Id: 4, Description: "Fly Over"},
            ];    
        var disturbanceTypeInfo = [
                {Id: 1, Description: "Kayakers"},
                {Id: 2, Description: "Fishermen (wade)"},
                {Id: 3, Description: "Stationary boats"},
                {Id: 4, Description: "Moving boats"},
                {Id: 5, Description: "Personal watercraft (jetski, windsurfer)"},
                {Id: 6, Description: "Humans on foot"},
                {Id: 7, Description: "Noise (specify source)"},
                {Id: 8, Description: "Other: (list)"}
            ];
        
        return {
            censusForm: censusForm,
            tideInfo: tideInfo,
            weatherInfo: weatherInfo,
            vantagePointInfo: vantagePointInfo,
            accessPointInfo: accessPointInfo,
            siteTypeInfo: siteTypeInfo,
            feedingRateInfo: feedingRateInfo,
            habitatInfo: habitatInfo, 
            behaviorTypeInfo: behaviorTypeInfo,
            disturbanceTypeInfo: disturbanceTypeInfo   
        };    
    });