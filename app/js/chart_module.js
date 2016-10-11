/**
 * Created by trieutran on 7/5/16.
 * @file
 * This is a module for creating response time chart based on user's input of sleeping times and
 * caffeine drinks.  It is "Highcharts" library to generate the chart.
 *
 * The module consists of two main parts
 * - Directive: to transform html dom element into a chart
 *
 * - Controller:
 */
var atoAlertnessChartModule = angular.module('atoAlertnessChartModule', []);

atoAlertnessChartModule.directive('alertnessChart', ['moment', function(){
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
                        marginTop: 10
                    },
                    title: {
                        text: 'What\'s My Charge?',
                        x:'165'
                    },
                    exporting: {
                        enabled: false
                    },
                    xAxis: {
                        type: 'datetime',
                        /*dateTimeLabelFormats: {
                            day: '%b %e',
                        },*/
                        plotBands: $scope.data.plotBands,
                        plotLines: $scope.data.plotLines,
                        tickInterval: 6 * 60 * 60 * 1000,  // quarter day
                        minorTickInterval: 6 * 60 * 60 * 1000, // quarter of  day,
                        labels: {
                            //autoRotation: [-10, -20, -30, -40, -50, -60, -70, -80, -90]
                            autoRotation: [0],
                            formatter: function() {
                                var output = '';
                                if(this.value % (24 * 60 * 60 * 1000) == 0) {
                                    output = '<span class="chart_major_ticks"><strong>' + moment.utc(this.value).format('MMM D') + '</strong></span>';
                                }
                                else {
                                    output = '<span class="chart_minor_ticks">' + moment.utc(this.value).format('HH:mm') + '</span>';
                                }

                                return output;
                            }
                        }
                    },
                    yAxis: {
                        title: {
                            text: 'Response Time (ms)',
                            x:-10,
                            style: {
                              fontSize:'22px',
                              color:'#FFFFFF'
                            }
                        },
                        reversed: true,
                        max: 370,
                        //min: 230,
                        min: 200,
                        //minorGridLineColor: 'rgba(159, 160, 158, 0.5)',
                        minorTickInterval: 0.5,
                        plotBands: [
                            {
                                from: 200,
                                to: 270,
                                color: 'rgba(138, 236, 71, .5)'
                            }
                        ]
                    },
                    tooltip: {
                        dateTimeLabelFormats: {
                            millisecond:"%A, %b %e, %H:%M",
                            second:"%A, %b %e, %H:%M",
                            minute:"%A, %b %e, %H:%M",
                        },
                        valueSuffix: ' ms',
                        crosshairs: true,
                        backgroundColor:'#0c2911',
                        borderRadius: '10',
                        style: {
                          padding: 10,
                          color: '#FFFFFF',
                          fontWeight: 'bold',
                          direction: 'ltr'

                        },
                        positioner: function(labelWidth, labelHeight, point) {
                            return { x: point.plotX, y: (point.plotY > 370 - 50 ? 270 : point.plotY) };
                        }
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
                        name: 'Response Time',
                        data: $scope.data.series,
                        pointStart: $scope.data.begTS,
                        pointInterval: 15 * 60 * 1000,
                        showInLegend: false,
                        shadow: true
                    }]
                });
            });
        }
    };
}])
.controller('ChartController', ['$window', '$rootScope', '$scope', '$location', 'DataPredictionService', 'MyChargeDataService',
    'usSpinnerService', 'moment', 'DEFAULT_SLEEP_DURATION', '$uibModal',
    function($window, $rootScope, $scope, $location, DataPredictionService, MyChargeDataService, usSpinnerService,
            moment, DEFAULT_PREDICTION_DAYS, $uibModal) {
        $scope.isExpired = false;
        $scope.chartData = {};
        $scope.error = null;

        if($rootScope.DataPredictiondate != 0) {
            $scope.endDate = $rootScope.DataPredictiondate;
        }
        else {
            $scope.endDate = moment().startOf('day').toDate();
        }

        $scope.startDate = moment($scope.endDate).subtract(DEFAULT_PREDICTION_DAYS, 'days').toDate();

        $scope.actualEndDate = moment($scope.endDate).add(2, 'days').toDate();
        //$scope.actualEndDate = moment($scope.endDate).add(0, 'days').toDate();

        /*console.log('root prediction date');
        console.log($rootScope.DataPredictiondate);
        console.log('end date');
        console.log($scope.endDate);
        console.log('actual end date');
        console.log($scope.actualEndDate);
        console.log('start date');
        console.log($scope.startDate);*/

        $scope.endOpen = false;

        $scope.toggle = function($event, field) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope[field] = !$scope[field];
        };

        $scope.transformData = function(r) {
            var chartData = {};
            if(r.data.length > 0) {
                var ts = $scope.startDate;
                var begTime = moment.utc($scope.startDate).startOf('day').add(0, 'days').toDate().getTime();

                chartData.begTS = begTime + ($scope.requestData.sleepStartTime) * 60 * 60 * 1000;

                //calculate sleep periods
                var sleepPeriods = [];
                var accumTime = 0;

                for(var i = 0; i < $scope.requestData.sleepWakeSchedule.length; i++) {
                    var sleep = {
                        label: {
                            text: 'Zzz',
                            style: {
                                color: '#fbec22',
                                fontSize:'16px',
                                padding: 10
                            },
                            verticalAlign: 'bottom',
                            textAlign: 'right',
                            y: -20,
                            x: 10
                        }
                    };
                    if(i == 0) {
                        sleep.color = '#ffb225';
                        sleep.from = begTime + $scope.requestData.sleepStartTime * 60 * 60 * 1000;
                        sleep.to = sleep.from + $scope.requestData.sleepWakeSchedule[i]* 60 * 60 * 1000;
                        accumTime += $scope.requestData.sleepStartTime;
                        sleepPeriods.push(sleep);
                    }
                    else {
                        accumTime += $scope.requestData.sleepWakeSchedule[i-1];

                        if(i % 2 == 0) {
                            sleep.color = '#ffb225';
                            sleep.from = begTime + accumTime * 60 * 60 * 1000;
                            sleep.to = sleep.from + $scope.requestData.sleepWakeSchedule[i]* 60 * 60 * 1000;
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
                        dashStyle: 'dash',
                        label: {
                            text: $scope.requestData.caffeineItems[i],
                            style: {
                                color: '#FFFFFF',
                                fontSize:'12px',
                                padding: 10,
                                display:'block',
                                direction: 'ltr'
                            },
                            verticalAlign: 'bottom',
                            textAlign: 'right',
                            y: -10,
                            x: 10

                        },
                        value: begTime + ($scope.requestData.caffeineTimes[i]) * 60 * 60 * 1000,
                        width: 4,
                        height: 4,
                        zIndex: 1
                    };

                    caffeine.push(c);
                }
                chartData.plotLines = caffeine;

                chartData.series = [];
                for(var j = 1; j < r.data.length; j++) {
                    chartData.series.push(parseFloat(r.data[j].value.toPrecision(4)));
                }

                var majorTicks = [];

                for(var m = 0; m < DEFAULT_PREDICTION_DAYS + 4; m++) {
                    var mTicks = {
                        color: '#FFFAA7',
                        dashStyle: 'solid',
                        value: begTime + m * 24 * 60 * 60 * 1000,
                        width: 2,
                        height: 4,
                        zIndex: 1
                    };

                    chartData.plotLines.push(mTicks);
                }

            }
            //console.log(chartData);
            return chartData;
        };

        $scope.data = [];
        $scope.requestData = {};
        $scope.lastTimeStamp = 0;

        $scope.getMyChargeData = function(){
            MyChargeDataService.prepareSubmissionData($scope.startDate, $scope.actualEndDate, function(d){
                console.log(d);

                if(d.data != null) {
                    if(d.data.data.sleepWakeSchedule.length > 0){
                        $scope.requestData = d.data.data;
                        $scope.lastTimeStamp = d.data.timestamp;
                    }
                }
            })
        };

        $scope.getMyChargeData();

        $scope.showSpinner = true;

        $scope.GetPredictionData = function() {
            DataPredictionService.getData($scope.requestData, $rootScope.renewPrediction, $scope.lastTimeStamp,
                function(response){
                    console.log(response);
                    if(response.success == true || response.success == "true") {
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

        $scope.GetPredictionData();

        $scope.applyStartDate = function(){
            $scope.startDate = moment($scope.endDate).subtract(DEFAULT_PREDICTION_DAYS, 'days').toDate();
            $scope.actualEndDate = moment($scope.endDate).add(2, 'days').toDate();
            $rootScope.DataPredictiondate = $scope.endDate;
            $scope.getMyChargeData();
            $scope.GetPredictionData();
        };

        $scope.openModal = function(){
            var modalInstance = $uibModal.open({
                windowTemplateUrl: './templates/modal/window.html',
                templateUrl: 'myChargeInfoModal.html',
                controller: 'ChartModuleModalController',
                backdrop: false,
                size: 'small',
                scope: $scope,
                resolve: {
                    calEvent: function(){
                        return event;
                    }
                }
            });

            modalInstance.result.then(function (msg) {
                    //vm.message = msg;
                    //console.log('closed');
                }, function(){
                    //console.log('dismiss');
                }
            );
        };
    }
]);

atoAlertnessControllers.controller('ChartModuleModalController', ['$rootScope', '$scope', '$uibModalInstance',
    function($rootScope, $scope, $uibModalInstance) {
        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

    }
]);
