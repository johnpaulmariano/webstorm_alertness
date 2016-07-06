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

                console.log($scope.data);
                console.log(value);

                if (!value)
                    return;

                Highcharts.chart($element[0], {
                    chart: {
                        type: 'spline',
                        width: 2000,
                        marginTop: 50
                    },

                    title: {
                        text: ''
                    },
                    exporting: {
                        enabled: false
                    },
                    xAxis: {
                        type: 'datetime',
                        dateTimeLabelFormats: {
                            day: '%b %e '
                        },
                        labels: {
                            overflow: 'justify'
                        },
                        plotBands: $scope.data.plotBands,
                        plotLines: $scope.data.plotLines,
                        tickInterval: 24 * 60 * 60 * 1000,
                        minorTickInterval: 12 * 60 * 60 * 1000,
                        //gridLineDashType: 'Dash',
                        //gridLineColor: 'rgba(159, 160, 158, 0.5)'

                    },
                    yAxis: {
                        title: {
                            text: 'Response Speed'
                        },
                        max: 6,
                        min: 2,
                        minorGridLineColor: 'rgba(159, 160, 158, 0.5)',
                        minorTickInterval: 0.5,
                        //gridLineWidth: 1,
                        //gridLineDashType: 'Dash',
                        //gridLineColor: "rgba(159, 160, 158, 0.9)",
                        //alternateGridColor: null,
                        plotBands: [

                            {
                                from: 4,
                                to: 5,
                                color: 'rgba(132, 185, 97, 0.3)',
                                /*label: {
                                    text: 'Slow',
                                    style: {
                                        color: '#f7f5f5'
                                    }
                                },*/

                            }
                        ]
                    },
                    tooltip: {
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
                        pointInterval: 15 * 60 * 1000
                    }],
                    navigation: {
                        menuItemStyle: {
                            fontSize: '10px'
                        }
                    }
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
        $scope.submittedTime = '';

        //temporary enforce renew
        $rootScope.renewPrediction = true;

        $scope.filterData = function(r){
            for(var j = 0; j < r.data.length; j++) {
                if(r.data[j].value <= 2) {
                    r.data[j].value = 2;
                }
                else if(r.data[j].value >= 6) {
                    r.data[j].value = 6;
                }
                else {
                    r.data[j].value = r.data[j].value.toPrecision(4);
                }
                //data[j].epoch = timeStartPoint + 15 * 60 * 1000 * j;
            }

            return r;
        };

        $scope.transformData = function(r) {
            var chartData = {};
            console.log($scope.requestData);
            if(r.data.length > 0) {
                //r = $scope.filterData(r);

                var ts = new Date(r.time);
                $scope.submittedTime = ts.toLocaleString();
                var sleepStartTime = $scope.requestData.sleepStartTime;
                var begTime = Date.UTC(ts.getFullYear(), ts.getMonth(), ts.getDate() - r.numDays, 0, 0, 0, 0);
                var begTS = begTime + sleepStartTime * 60 * 60 * 1000;
                chartData.begTS = begTS;

                //calculate sleep periods
                var sleepPeriods = [];
                var accumTime = 0;
                for(var i = 0; i < $scope.requestData.sleepWakeSchedule.length; i++) {
                    var sleep = {};

                    if(i == 0) {
                        sleep.color = 'rgba(68, 170, 213, 0.5)';
                        sleep.from = begTS;
                        sleep.to = sleep.from + $scope.requestData.sleepWakeSchedule[i] * 60 * 60 * 1000;
                        sleepPeriods.push(sleep);
                    }
                    else if(i % 2 == 0) {
                        sleep.color = 'rgba(68, 170, 213, 0.5)';
                        sleep.from = begTS + accumTime * 60 * 60 * 1000;
                        sleep.to = sleep.from + $scope.requestData.sleepWakeSchedule[i] * 60 * 60 * 1000;
                        sleepPeriods.push(sleep);
                    }

                    accumTime += $scope.requestData.sleepWakeSchedule[i];
                }
                chartData.plotBands = sleepPeriods;

                //calculate caffeine time
                var caffeine = [];
                for(var i = 0; i < $scope.requestData.caffeineTimes.length; i++) {
                    var c = {
                        color: 'rgba(230,8,18,0.7)',
                        dashStyle: 'Solid',
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

            return chartData;
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
                    //caffeineDoses:[],
                    //caffeineTimes:[],
                    caffeineDoses: [400, 400, 400, 400, 400],
                    caffeineTimes: [90,119,143,167,191],
                    numDays: 14
                };
            }
        });

        $scope.showSpinner = true;

        var GetPredictionData = function() {
            DataPredictionService.getData($scope.requestData, $rootScope.renewPrediction,
                function(response){
                    console.log(response);
                    if(response.success == true) {
                        $scope.showSpinner = false;
                        $rootScope.renewPrediction = false; // turn off the renew prediction request from MyCharge inputs

                        $scope.chartData = $scope.transformData(response);



                        /**/
                    }
                    else {
                        $scope.error = response.message;
                        $scope.showSpinner = false;
                    }
                }
            );
        };

        GetPredictionData();

        $scope.$watch('chartData', function(value){
            console.log('changed');
            console.log($scope.chartData);
        });
        //$scope.chartData.series = [1,2,3,4,5,3,2,1,5];
    }
]);
