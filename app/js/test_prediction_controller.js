/**
 * Created by trieutran on 7/1/16.
 */
atoAlertnessControllers.controller('TestController', ['$window', '$rootScope', '$scope', '$location', 'DataPredictionService',
    function($window, $rootScope, $scope, $location, DataPredictionService) {
        //expecting data format
        $scope.scenario = 5;
        $scope.data = [];


        $scope.transformHours = function(h){
            var remainder = h % 1;
            var hour = h - remainder;
            hour = hour % 24;

            remainder = remainder * 60;
            //remainder.toPrecision(4);
            remainder = Math.round(remainder);

            if(remainder < 10) {
                remainder = "0" + remainder;
            }

            if(hour < 10) {
                hour = "0" + hour;
            }

            var hStr = hour + ':' + remainder;

            return hStr;
        };

        $scope.getData = function getData(scenario) {
            switch(scenario) {
                case 1:
                    var sleepStartTime = 23;
                    var sleepWakeSchedule = [8, 16, 8, 16, 8, 16, 8, 16, 8, 16, 8, 16, 8];
                    var numDays = 8;
                    var caffeineDoses = [];
                    var caffeineTime = [];
                    break;

                case 2:
                    var sleepStartTime = 23;
                    var sleepWakeSchedule = [8,40,8,40,8,16,8,40,8,16,8,16,8,16,8,16,8,16,8,16,8];
                    var numDays = 14;
                    var caffeineDoses = [];
                    var caffeineTime = [];
                    break;

                case 3:
                    var sleepStartTime = 23;
                    var sleepWakeSchedule = [8,16,8,16,8,16,8,16,8,16,8,16,8,16,8,16,8,16,8,16,8,16,8,16,8,16,8];
                    var numDays = 14;
                    var caffeineDoses = [820,165,230];
                    var caffeineTime = [10.116666666666667,296,320];
                    break;

                case 4:
                    var sleepStartTime = 23;
                    var sleepWakeSchedule = [8,16,8,16,8,16,8,16,8,16,8,16,8,16,8,16,8,16,8,16,8,16,8,16,8,16,8,16,8,16,8,16,8,16,8];
                    var numDays = 18;
                    var caffeineDoses = [];
                    var caffeineTime = [];
                    break;
                //---------------------------
                case 5:     // 5 Nights SR
                    var sleepStartTime = 23;
                    var sleepWakeSchedule = [8, 16, 8, 16, 8, 21, 3, 21, 3, 21, 3, 21, 3, 21, 3, 16, 8, 16, 8, 16, 8];
                    var caffeineDoses = [];
                    var caffeineTimes = [];
                    var numDays = 11;
                    break;

                case 6:     // 5 nights SR with caffeine
                    var sleepStartTime = 23;
                    var sleepWakeSchedule = [8, 16, 8, 16, 8, 21, 3, 21, 3, 21, 3, 21, 3, 21, 3, 16, 8, 16, 8, 16, 8];
                    var caffeineDoses = [400, 400, 400, 400, 400];
                    var caffeineTimes = [104,128,152,176,200];
                    var numDays = 11;
                    break;

                case 7: // 72 hrs TSD
                    var sleepStartTime = 23;
                    var sleepWakeSchedule = [8,16,8,16,8,88,8,16,8,16,8];
                    var caffeineDoses = [];
                    var caffeineTimes = [];
                    var numDays = 9;
                    break;

                case 8: // 72 hrs TSD with caffeine
                    var sleepStartTime = 23;
                    var sleepWakeSchedule = [8,16,8,16,8,88,8,16,8,16,8];
                    var caffeineDoses = [600, 600, 600];
                    var caffeineTimes = [99,123,147];
                    var numDays = 9;
                    break;

                case 9: // 5 day time sleeps
                    var sleepStartTime = 23;
                    var sleepWakeSchedule = [8,16,8,16,8,24,6,18,6,18,6,18,6,18,6,10,8,16,8,16,8];
                    var caffeineDoses = [];
                    var caffeineTimes = [];
                    var numDays = 11;
                    break;

                case 10:    // 5 day time sleeps w ith caffeine
                    var sleepStartTime = 23;
                    var sleepWakeSchedule = [8,16,8,16,8,24,6,18,6,18,6,18,6,18,6,10,8,16,8,16,8];
                    var caffeineDoses = [400, 400, 400, 400, 400];
                    var caffeineTimes = [95,119,143,167,191];
                    var numDays = 11;
                    break;
            }

            var paddingThreeDays = function(sleepWake){
                //extracting the last sleep
                //var last = sleepWake[sleepWake.length - 1];
                //sleepWake.splice(sleepWake.length, 0, 24 - last, 8, 16, 8, 16, 8);

                return sleepWake;
            };

            var result = {
                success: true,
                data: {
                    sleepStartTime: sleepStartTime,
                    sleepWakeSchedule:paddingThreeDays(sleepWakeSchedule),
                    caffeineDoses:caffeineDoses,
                    caffeineTimes:caffeineTimes,
                    numDays:numDays
                },
                /*rawData: {
                 "sleeps": [
                 [{"startHour":23,"startMinute":0,"durationHour":8,"durationMinute":0,"startTime":1380,"endTime":1860,"durationTime":480}],
                 [{"startHour":23,"startMinute":0,"durationHour":8,"durationMinute":0,"startTime":1380,"endTime":1860,"durationTime":480}]
                 ],
                 "drinks":[null,null],
                 "numberOfDays":2
                 }*/
            };

            DataPredictionService.getData(result.data, true, function (response) {
                if (response.success == true) {
                    //$location.path("/gauge2");
                    $scope.data = response.data;

                }
                else {
                    $scope.message = response.message;
                }
            });
        }

        $scope.getData($scope.scenario);

    }
]);