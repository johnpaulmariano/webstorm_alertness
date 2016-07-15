/**
 * Created by trieutran on 7/5/16.
 */
var atoAlertnessChartModule = angular.module('atoAlertnessChartModule', []);

atoAlertnessChartModule.directive('alertnessChart', function(){
    return {
        restrict: 'E',
        template: '<div></div>',
        scope: {
            title: '@',
            data: '='
        },
        link: function ($scope, $element) {
            $scope.$watch('data', function(value) {
                if (!value)
                    return;

                Highcharts.chart($element[0], {
                    chart: {
                        type: 'spline',
                        width: 2000,
                        marginTop: 50
                    },
                    title: {
                        text: null
                    },
                    exporting: {
                        enabled: false
                    },
                    xAxis: {
                        type: 'datetime',
                        dateTimeLabelFormats: {
                            day: '%b %e, %Y'
                        },
                        plotBands: $scope.data.plotBands,
                        plotLines: $scope.data.plotLines,
                        tickInterval: 24 * 60 * 60 * 1000,
                        minorTickInterval: 12 * 60 * 60 * 1000,
                    },
                    yAxis: {
                        title: {
                            text: 'Response Speed'
                        },
                        max: 6,
                        min: 2,
                        //minorGridLineColor: 'rgba(159, 160, 158, 0.5)',
                        minorTickInterval: 0.5,
                        plotBands: [
                            {
                                from: 4,
                                to: 5,
                                color: 'rgba(132, 185, 97, 0.3)',
                            }
                        ]
                    },
                    tooltip: {
                        dateTimeLabelFormats: {
                            minute: '%A, %b %e, %Y, %H:%M'
                        },
                        valueSuffix: ' m/s',
                        crosshairs: true
                    },
                    plotOptions: {
                        spline: {
                            lineWidth: 4,
                            states: {
                                hover: {
                                    lineWidth: 5
                                }
                            },
                            marker: {
                                enabled: false
                            }
                        }
                    },
                    series: [{
                        name: 'Response Speed',
                        data: $scope.data.series,
                        pointStart: $scope.data.begTS,
                        pointInterval: 15 * 60 * 1000,
                        showInLegend: false
                    }]
                });
            });
        }
    };
})
.controller('ChartController', ['$window', '$rootScope', '$scope', '$location', 'DataPredictionService', 'MyChargeService','usSpinnerService', 'PREDICTION_DATA_EXPIRATION',
    function($window, $rootScope, $scope, $location, DataPredictionService, MyChargeService, usSpinnerService, PREDICTION_DATA_EXPIRATION) {
        $scope.isExpired = false;
        $scope.expiredIn = PREDICTION_DATA_EXPIRATION;
        $scope.chartData = {};

        //$rootScope.renewPrediction = false;

        $scope.transformData = function(r) {
            var chartData = {};
            //console.log($scope.requestData);
            //console.log(r);
            if(r.data.length > 0) {
                //r = $scope.filterData(r);

                var ts = new Date(r.time);
                //var sleepStartTime = $scope.requestData.sleepStartTime % 24;
                var begTime = Date.UTC(ts.getFullYear(), ts.getMonth(), ts.getDate() - r.numDays, 0, 0, 0, 0);
                //console.log(begTime);
                //var begTS = begTime + sleepStartTime * 60 * 60 * 1000;
                chartData.begTS = begTime;

                //calculate sleep periods
                var sleepPeriods = [];
                var accumTime = 0;

                for(var i = 0; i < $scope.requestData.sleepWakeSchedule.length; i++) {
                    //
                    if(i == 0) {
                        var sleep = {};
                        sleep.color = 'rgba(68, 170, 213, 0.5)';
                        sleep.from = begTime + $scope.requestData.sleepStartTime * 60 * 60 * 1000;
                        sleep.to = begTime + ($scope.requestData.sleepStartTime + $scope.requestData.sleepWakeSchedule[i])* 60 * 60 * 1000;
                        accumTime += $scope.requestData.sleepStartTime;
                        sleepPeriods.push(sleep);
                    }
                    else {
                        accumTime += $scope.requestData.sleepWakeSchedule[i];

                        if(i % 2 == 0) {
                            var sleep = {};
                            sleep.color = 'rgba(68, 170, 213, 0.5)';
                            sleep.from = begTime + accumTime * 60 * 60 * 1000;
                            sleep.to = begTime + (accumTime + $scope.requestData.sleepWakeSchedule[i])* 60 * 60 * 1000;
                            //accumTime += $scope.requestData.sleepWakeSchedule[i];
                            sleepPeriods.push(sleep);
                        }
                    }
                }
                chartData.plotBands = sleepPeriods;

                //calculate caffeine time
                var caffeine = [];
                for(var i = 0; i < $scope.requestData.caffeineTimes.length; i++) {
                    var c = {
                        color: 'rgba(230,8,18,0.7)',
                        dashStyle: 'solid',
                        label: {
                            text: "Caffeine drink",
                            style: {
                                color: 'rgba(230,8,18,0.7)',
                                'margin-bottom': '20px'
                            },
                            verticalAlign: 'bottom',
                            textAlign: 'right'
                        },
                        value: begTime + $scope.requestData.caffeineTimes[i] * 60 * 60 * 1000,
                        width: 2,
                        zIndex: 12
                    };

                    caffeine.push(c);
                }
                chartData.plotLines = caffeine;

                chartData.series = [];
                for(var j = 0; j < r.data.length; j++) {
                    if(r.data[j].value <= 2) {
                        chartData.series.push(2);
                    }
                    else if(r.data[j].value >= 6) {
                        chartData.series.push(6);
                    }
                    else {
                        chartData.series.push(parseFloat(r.data[j].value.toPrecision(4)));
                    }
                }
            }
            //console.log(chartData);
            return chartData;
        };

        $scope.data = [];
        $scope.requestData = {};
        $scope.lastTimeStamp = 0;

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
                $scope.lastTimeStamp = d.timestamp;
                //$scope.requestData.sleepWakeSchedule = paddingThreeDays($scope.requestData.sleepWakeSchedule);
            }
            else {
                //default data to send to the prediction API
                var defaultSleepWake = [8.0,16,8.0, 16, 8.0, 16, 8, 16, 8, 16,8, 16, 8, 16, 8, 16, 8, 16, 8, 16, 8, 16, 8, 16, 8, 16, 8];
                //var defaultSleepWake = [8,16,8,16,8,24,6,18,6,18,6,18,6,18,6,10,8,16,8,16,8];
                //defaultSleepWake = paddingThreeDays(defaultSleepWake);
                $scope.requestData = {
                    sleepStartTime: 23,
                    sleepWakeSchedule:defaultSleepWake,
                    caffeineDoses:[],
                    caffeineTimes:[],
                    //caffeineDoses: [400, 400, 400, 400, 400],
                    //caffeineTimes: [90,119,143,167,191],
                    numDays: 14
                };
                var d = new Date();
                $scope.lastTimeStamp = d.getTime();
            }
        });

        $scope.showSpinner = true;

        var GetPredictionData = function() {
            DataPredictionService.getData($scope.requestData, $rootScope.renewPrediction, $scope.lastTimeStamp,
                function(response){
                    //console.log(response);
                    if(response.success == true) {
                        $scope.showSpinner = false;
                        $rootScope.renewPrediction = false; // turn off the renew prediction request from MyCharge inputs

                        $scope.chartData = $scope.transformData(response);
                    }
                    else {
                        $scope.error = response.message;
                        $scope.showSpinner = false;
                    }
                }
            );
        };

        GetPredictionData();
    }
]);
