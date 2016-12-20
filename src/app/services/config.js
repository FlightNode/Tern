'use strict';

// Every *generic* endpoint below should end with a trailing slash

angular.module('flightNodeApp')
    .factory('config', function() {
        var baseHref = 'http://localhost:50323/';
        var baseV1Href = baseHref + 'api/v1/';
        var enums = baseV1Href + 'enums/';
        return {
            locations: baseV1Href + 'locations/',
            locationsSimpleList: baseV1Href + 'locations/simple',
            users: baseV1Href + 'users/',
            usersRegister: baseV1Href + 'users/register',
            usersPending: baseV1Href + 'users/pending',
            usersSimpleList: baseV1Href + 'users/simplelist',
            usersProfile: baseV1Href + 'users/profile',
            workLogs: baseV1Href + 'worklogs/',
            workLogsForUser: baseV1Href + 'worklogs/my',
            exportWorkLogs: baseV1Href + 'worklogs/export/',
            workTypes: baseV1Href + 'worktypes/',
            workTypesSimpleList: baseV1Href + 'worktypes/simple',
            token: baseHref + 'oauth/token', // should not have trailing slash
            navigation: baseV1Href + 'nav',
            roles: baseV1Href + 'roles/',
            birdspecies: baseV1Href + 'birdspecies/',
            waterbirdForagingSurvey: baseV1Href + 'waterbirdforagingsurvey/',
            surveyTypes: baseV1Href + 'surveytypes/',

            weather: enums + 'weather',
            waterheights: enums + 'waterheights',
            disturbancetypes: enums + 'disturbancetypes',
            habitattypes: enums + 'habitattypes',
            feedingsuccessrates: enums + 'feedingsuccessrates',
            activitytypes: enums + 'activitytypes',
            siteassessments: enums + 'siteassessments',
            vantagepoints: enums + 'vantagepoints',
            accesspoints: enums + 'accesspoints',
            windspeeds: enums + 'windspeeds',
            winddirections: enums + 'winddirections',

            foragingExport: baseV1Href + 'waterbirdforagingsurvey/export',
            rookeryCensus: baseV1Href + 'rookerycensus/',
            rookeryCensusExport: baseV1Href + 'rookerycensus/export',
            contact: baseV1Href + 'contact',
            requestReset: baseV1Href + 'users/requestreset',
            changePassword: baseV1Href + 'users/changepassword',

            googleMapsUrl: 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAyPcJlSr4PC2k0ek6lLg8W-ScYNFxNpZM'
        };
    });
