/**
 * Created by trieutran on 7/1/16.
 */
atoAlertnessControllers.controller('Gauge2Controller', ['$window', '$rootScope', '$scope', '$location', 'DataPredictionService', 'MyChargeService','usSpinnerService', 'PREDICTION_DATA_EXPIRATION',
    function($window, $rootScope, $scope, $location, DataPredictionService, MyChargeService, usSpinnerService, PREDICTION_DATA_EXPIRATION) {
        //initiate vars for sliders
        $scope.hourRange = 24;
        $scope.tickInterval = 4;
        $scope.step = 1;
        $scope.defaultTick = 0;
        $scope.minRange = 0;
        $scope.maxRange = 0;
        $scope.sliderVal = undefined;
        $scope.sliderValText = "0";
        $scope.dataTimeStamp = null;
        $scope.gaugeText = '';
        $scope.isExpired = false;
        $scope.expiredIn = PREDICTION_DATA_EXPIRATION;

        var d = new Date();
        $scope.currentTime = d.toLocaleString();
        $scope.format = 'M/d/yy h:mm:ss a';

        $scope.initializeGauge = function() {
            $scope.gauge = {};
            $scope.gauge.value = 2;
            $scope.gauge.upperLimit = 6;
            $scope.gauge.lowerLimit = 2;
            $scope.gauge.unit = "";
            $scope.gauge.precision = 2;

            $scope.gauge.ranges = [
                {
                    min: 2,
                    max: 2.8,
                    color: '#bc1705'
                },
                {
                    min: 2.8,
                    max: 3.6,
                    color: '#ae4c0f'
                },
                {
                    min: 3.6,
                    max: 4.4,
                    color: '#a07e1a'
                },
                {
                    min: 4.4,
                    max: 5.2,
                    color: ' #95ab23'
                },
                {
                    min: 5.2,
                    max: 6,
                    color: '#8ec929'
                }
            ];
        };

        $scope.filterData = function(r){
            console.log(r);
            // calculate the beginning of TS day
            var ts = new Date(r.time);
            var begTS = new Date(ts.getFullYear(), ts.getMonth(), ts.getDate(), 0, 0, 0, 0);
            var endTS = new Date(begTS.getTime() + $scope.expiredIn);

            var d = new Date();
            var currMinutes = d.getMinutes();
            var currHours = d.getHours();
            var currHourFraction = 0;

            if(currMinutes >= 0 && currMinutes < 7) {
                currHourFraction = 0;
            }
            else if(currMinutes >= 7 && currMinutes < 22) {
                currHourFraction = 0.25;
            }
            else if(currMinutes >= 22 && currMinutes < 37) {
                currHourFraction = 0.5;
            }
            else if(currMinutes >= 37 && currMinutes < 52) {
                currHourFraction = 0.75;
            }
            else {
                currHourFraction = 1;
            }

            if(currHourFraction == 1) {
                currHours ++;
                currHourFraction = 0;
            }

            var newCurrDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), currHours, currHourFraction * 60, 0, 0);

            //check if data is expired
            if(newCurrDate.getTime() > endTS.getTime()) {
                $scope.isExpired = true;
            }

            //calculate the mid point of the slider based on approx. current time
            var currentTimeSlot = r.numDays * 24 + currHours + currHourFraction;

            //search for the middle point
            var midPoint = 0;
            for(var i = 0; i < r.data.length; i++) {
                if(r.data[i].time < currentTimeSlot) {
                    continue;
                }
                else {
                    midPoint = i;
                    break;
                }
            }

            //calculate the beggining and ending point of slider
            var startPoint = 0;
            var timeStartPoint = 0;
            var endPoint = r.data.length -  1;
            if(midPoint - 2 * 24 * 4 > 0) {
                startPoint = midPoint - 2 * 24 * 4;
                timeStartPoint = newCurrDate.getTime() - (r.data[midPoint].time - r.data[startPoint].time) * 60 * 60 * 1000;
            }

            if(midPoint + 2 * 24 * 4 + 1 < r.data.length) {
                endPoint = midPoint + 2 * 24 * 4 + 1;
            }

            $scope.sliderVal = midPoint - startPoint;
            $scope.defaultTick = $scope.sliderVal;

            var data = r.data.slice(startPoint, endPoint);

            for(var j = 0; j < data.length; j++) {
                if(data[j].value <= 2) {
                    data[j].value = 2;
                }
                else if(data[j].value >= 6) {
                    data[j].value = 6;
                }

                data[j].epoch = timeStartPoint + 15 * 60 * 1000 * j;
            }

            return data;
        };

        $scope.data = [];
        $scope.requestData = {};

        MyChargeService.getData(function(d){
            //padding 3 days for predictions
            var paddingThreeDays = function(sleepWake){
                //extracting the last sleep
                var last = sleepWake[sleepWake.length - 1];
                sleepWake.splice(sleepWake.length, 0, 24 - last, 8, 16, 8, 16, 8);

                return sleepWake;
            };

            if(d){
                $scope.requestData = d.data;
                $scope.requestData.sleepWakeSchedule = paddingThreeDays($scope.requestData.sleepWakeSchedule);
            }
            else {
                //default data to send to the prediction API
                var defaultSleepWake = [8.0,16,8.0, 16, 8.0, 16, 8, 16, 8, 16,8, 16, 8, 16, 8, 16, 8, 16, 8, 16, 8, 16, 8, 16, 8, 16, 8];
                defaultSleepWake = paddingThreeDays(defaultSleepWake);
                $scope.requestData = {
                    sleepStartTime: 23,
                    sleepWakeSchedule:defaultSleepWake,
                    caffeineDoses:[],
                    caffeineTimes:[],
                    numDays: 14
                };
            }
        });

        $scope.setGaugeText = function(d) {
            $scope.gaugeText =  d.epoch;
        };

        $scope.showSpinner = true;
        var d = new Date();
        $scope.lastTimeStamp = d.getTime();

        var GetPredictionData = function() {
            DataPredictionService.getData($scope.requestData, $rootScope.renewPrediction, $scope.lastTimeStamp,
                function(response){
                    if(response.success == true) {
                        $scope.showSpinner = false;
                        $rootScope.renewPrediction = false; // turn off the renew prediction request from MyCharge inputs
                        $scope.data = $scope.filterData(response);

                        if($scope.data.length > 0) {
                            var ts = new Date(response.time);
                            $scope.dataTimeStamp = ts.toLocaleString();

                            //initiate vars for gauge
                            $scope.initializeGauge();

                            $scope.maxRange = $scope.data.length - 1;
                            $scope.gauge.value = $scope.data[$scope.defaultTick].value;
                            $scope.setGaugeText($scope.data[$scope.defaultTick]);

                            //slider config
                            //$scope.settingSlider();
                            $scope.minSlider = {
                                minValue: $scope.minRange,
                                maxValue: $scope.maxRange,
                                value: $scope.sliderVal,
                                options: {
                                    floor: $scope.minRange,
                                    ceil: $scope.maxRange,
                                    step: $scope.step,
                                    //showTicks: true,
                                    translate: function(value){
                                        return $scope.getSlideVal(parseInt(value));
                                    },
                                    onChange: function() {
                                        var idx = $scope.minSlider.value;
                                        if(idx == $scope.data.length) {
                                            idx = idx-1;
                                        }
                                        $scope.gauge.value = $scope.data[idx].value;
                                        $scope.setGaugeText($scope.data[idx]);
                                    }
                                }
                            };
                        }


                    }
                    else {
                        $scope.error = response.message;
                        $scope.showSpinner = false;
                    }
                }
            );
        };

        GetPredictionData();

        $scope.getSlideVal = function(v){
            var valString = '';
            if(v == $scope.defaultTick) {
                valString = '';
            }
            else {
                var diff = v - $scope.defaultTick;
                var fraction = diff % 4;
                var hour = (diff - fraction) /4;
                var min = fraction * 15;
                var minStr = Math.abs(min);

                if(minStr < 10) {
                    minStr = "0" + minStr;
                }

                valString = (diff > 0 ? "" : "-") + Math.abs(hour) + " hour(s) " + minStr + " min(s)";
            }

            return valString;
        };

        $scope.resetGauge = function(){
            $rootScope.renewPrediction = true;
            $scope.showSpinner = true;
            MyChargeService.setData(null, function(){

            });
            GetPredictionData();
            $scope.isExpired = false;
        };
    }
// display a clock
]).directive('alertnessCurrentTime',  ['$interval', 'dateFilter',
    function($interval, dateFilter) {

        function link(scope, element, attrs) {
            var format,
                timeoutId;

            function updateTime() {
                element.text(dateFilter(new Date(), format));
            }

            scope.$watch(attrs.alertnessCurrentTime, function(value) {
                format = value;
                updateTime();
            });

            element.on('$destroy', function() {
                $interval.cancel(timeoutId);
            });

            // start the UI update process; save the timeoutId for canceling
            timeoutId = $interval(function() {
                updateTime(); // update DOM
            }, 1000);
        }

        return {
            link: link
        };
    }
]);