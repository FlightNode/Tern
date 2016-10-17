'use strict';

/**
 * @ngdoc function
 * @name flightNodeApp.Services:timeDateUtility
 * @description
 * # timeDateUtility
 * Utility service for working with date and time.
 */
angular.module('flightNodeApp')
    .factory('timeDateUtility', [
        function() {
            return {
                dateToHours: function(input) {
                    var mom = moment(input);
                    var h = mom.format('H').toString();
                    var m = (Math.round(mom.format('m') / 0.6)).toString();
                    return h + '.' + m;
                },

                hoursToDate: function(hours) {
                    var $this = this;
                    var parts = hours.toString().split('.');
                    var toParse = { hour: parts[0], minute: 0 };
                    if (parts[1]) { toParse.minute = $this.padRight(parts[1], 2, '0') * 0.6; }
                    return moment(toParse).format();
                },

                padRight: function(input, length, padChar) {
                    var output = input;
                    while (output.length < length - 1) {
                        output += padChar;
                    }
                    return output;
                }
            };
        }
    ]);
