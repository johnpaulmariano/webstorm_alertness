/**
 * Created by trieutran on 7/1/16.
 */
atoAlertnessControllers.controller('MyChargeController', ['$window', '$rootScope', '$scope', '$location', '$anchorScroll', '$uibModal','MyChargeService', 'CaffeineService', 'DataPredictionService',
    function($window, $rootScope, $scope, $location, $anchorScroll,$uibModal, MyChargeService, CaffeineService, DataPredictionService) {

        $scope.sleeps = [];
        $scope.caffeine = [];
        $scope.message = "";
        $scope.numberOfDays = 14;
        $scope.sleepDays = [];
        $scope.defaultStartSleepHour = 23;
        $scope.defaultStartSleepMinute = 0;
        $scope.defaultDurationHour = 8;
        $scope.defaultDurationMinute = 0;
        $scope.errorDays = [];


        $scope.convertSleepTime = function(startHour, startMinute, durationHour, durationMinute){
            var startTime = startHour * 60 + startMinute;
            var durationTime = (durationHour) * 60 + durationMinute;
            var endTime = startTime + durationTime;

            return {
                startHour: startHour,
                startMinute: startMinute,
                durationHour: durationHour,
                durationMinute: durationMinute,
                startTime: startTime,
                endTime: endTime,
                durationTime: durationTime
                //ts: day.getTime()
            };
        };

        $scope.formatTwoDigits = function(digit){
            if(digit < 10) {
                return "0" + digit;
            }
            else {
                return digit;
            }
        };

        $scope.createTimeDropdown = function(day, type) {
            var limit = 0;
            var multiplier = 0;

            if(type == 'minute') {
                limit = 60;
                multiplier = day * 24 * 60;
            }
            else if(type = 'hour') {
                limit = 24;
                multiplier = day * 24;
            }
            var timeOptions = [];

            for(var i = 0; i < limit; i++) {
                timeOptions.push(
                    {
                        val: multiplier + i,
                        txt: $scope.formatTwoDigits(i)
                    }
                );
            }

            return timeOptions;
        };

        $scope.createSleepDropdown = function(day, sHour, sMin, dHour, dMin) {
            var sleepObj = {
                day: day,
                selStartHour: {
                    val: sHour
                },
                selDurationHour: {
                    val: dHour
                },
                selStartMin: {
                    val: sMin
                },
                selDurationMin: {
                    val: dMin
                },
                startHours: $scope.createTimeDropdown(0, 'hour'),
                startMins: $scope.createTimeDropdown(0, 'minute'),
                durationHours: $scope.createTimeDropdown(0, 'hour'),
                durationMins: $scope.createTimeDropdown(0, 'minute')
            };

            return sleepObj;
        };

        $scope.createDayDropdown = function() {
            var arr = [];
            for(var i = 0; i < $scope.numberOfDays; i++) {
                arr.push(
                    {
                        txt: $scope.sleepDays[i].toDateString(),
                        val: i
                    }
                );
            }

            return arr;
        };

        $scope.setDefaultData = function(){
            var dateObj = new Date();

            $scope.sleeps = [];
            $scope.sleepDays = [];
            $scope.caffeine = [];

            for(var i = 0; i < $scope.numberOfDays; i++) {
                var ts = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate() -  i, 0, 0, 0, 0);
                var daySleep = [];
                daySleep.push($scope.convertSleepTime($scope.defaultStartSleepHour, $scope.defaultStartSleepMinute,
                    $scope.defaultDurationHour, $scope.defaultDurationMinute));

                $scope.sleeps.push(daySleep);
                $scope.sleepDays.push(ts);
                $scope.caffeine.push(null);
            }
        };
        //get saved data
        MyChargeService.getData(function(d){
            if(d){
                $scope.sleeps = d.rawData.sleeps;
                $scope.caffeine = d.rawData.drinks;
                $scope.numberOfDays = d.rawData.numberOfDays;

                //converting date strings to date objects
                for(var i = 0; i < d.rawData.sleepDays.length; i++) {
                    //var d = Date.parse(d.rawData.sleepDays[i]);
                    var dStr = d.rawData.sleepDays[i];
                    var dInt = Date.parse(dStr);
                    var dateObj = new Date(dInt);
                    $scope.sleepDays.push(dateObj);
                }

                console.log($scope.sleepDays);

            }
            else {
                $scope.setDefaultData();
                console.log($scope.sleeps);
                console.log($scope.sleepDays);
            }
        });

        $scope.addSleep = function() {
            var modalInstance = $uibModal.open({
                //animation: $scope.animationsEnabled,
                windowTemplateUrl: './templates/modal/window.html',
                templateUrl: 'sleepModal.html',
                controller: 'MyChargeModalController',
                backdrop: false,
                size: 'small',
                resolve: {
                    dayDropdowns: function() {
                        var $arr = $scope.createDayDropdown();
                        return $arr;
                    },
                    dropdowns: function () {
                        return $scope.createSleepDropdown(0, $scope.defaultStartSleepHour, $scope.defaultStartSleepMinute,
                            $scope.defaultDurationHour, $scope.defaultDurationMinute);
                    },
                    sleeps: function(){
                        return $scope.sleeps;
                    },
                    errorDays: function(){
                        return $scope.errorDays;
                    },
                    sleepDays: function(){
                        return $scope.sleepDays;
                    }
                }
            });

            modalInstance.result.then(function (msg) {
                    $scope.message = msg;
                }, function(){
                }
            );
        };

        $scope.removeSleep = function(day, sleep) {
            var sleepDay = $scope.sleepDays[day];

            if($window.confirm("Are you sure you want to remove this entry?")){
                //var daySleep = $scope.sleeps[day];
                $scope.sleeps[day].splice(sleep, 1);
                $scope.errorDays = [];
                $scope.message = "Sleep Time Removed in \"" + sleepDay.toDateString() + "\"";
            }
        };

        $scope.removeDay = function(day) {
            //var removedDay = $scope.sleeps[day];
            var dayStr = $scope.sleepDays[day].toDateString();
            if($window.confirm("Are you sure you want to remove \"" + dayStr + "\"?")){
                $scope.errorDays = [];
                $scope.sleeps.splice(day, 1);
                $scope.caffeine.splice(day, 1);
                $scope.sleepDays.splice(day, 1);
                $scope.numberOfDays --;
                //$scope.message = "Day " + ($scope.numberOfDays - day + 1) + " Removed";
                $scope.message = "\"" + dayStr + "\" Removed";
            }
        }

        $scope.addDay = function() {
            $scope.errorDays = [];

            //get the last date from $scope.sleeps
            var lastSleep = $scope.sleepDays[0];
            var newSleep = new Date(lastSleep.getFullYear(), lastSleep.getMonth(), lastSleep.getDate() + 1, 0, 0, 0, 0);

            $scope.sleeps.unshift([$scope.convertSleepTime($scope.defaultStartSleepHour, $scope.defaultStartSleepMinute,
                $scope.defaultDurationHour, $scope.defaultDurationMinute)]);
            $scope.caffeine.unshift(null);
            $scope.sleepDays.unshift(newSleep);
            $scope.numberOfDays ++;

            console.log($scope.sleepDays);
            $scope.message = "\"" + newSleep.toDateString() + "\" Added";
        };

        $scope.$watch('sleeps', function(){

            for(var i = 0; i < $scope.sleeps.length; i++) {
                $scope.sleeps[i].sort(function(a, b){
                    a = a.startTime;
                    b = b.startTime;

                    return a - b;
                });
            }
        }, true);

        $scope.createCaffeineDropdown = function(day, sHour, sMin, CaffeineService) {
            var caffeineItems = CaffeineService.getData();
            var quantity = [];

            for(var i = 1; i <= 10; i++) {
                quantity.push(i);
            }

            var caffeineObj = {
                startHours: $scope.createTimeDropdown(0, 'hour'),
                startMins: $scope.createTimeDropdown(0, 'minute'),
                caffeineItems: caffeineItems,
                quantity: quantity
            };

            return caffeineObj;
        };

        $scope.addCaffeine = function() {
            var modalInstance = $uibModal.open({
                //animation: $scope.animationsEnabled,
                windowTemplateUrl: './templates/modal/window.html',
                templateUrl: 'caffeineModal.html',
                controller: 'CaffeineModelController',
                backdrop: false,
                size: 'small',
                resolve: {
                    dayDropdowns: function() {
                        var $arr = $scope.createDayDropdown();
                        return $arr;
                    },
                    dropdowns: function () {
                        return $scope.createCaffeineDropdown(0, 0, 0, CaffeineService);
                    },
                    caffeine: function(){
                        return $scope.caffeine;
                    }
                }
            });

            modalInstance.result.then(function (msg) {
                $scope.message = msg;
            }, function () {
                //console.log('Modal dismissed at: ' + new Date());
            });
        };

        $scope.removeCaffeine = function(day, coffee){
            if($window.confirm("Are you sure you want to remove this entry?")) {
                var dayCoffee = $scope.caffeine[day];
                $scope.caffeine[day].splice(coffee, 1);
                $scope.message = "Caffeine Drink Removed";
            }
        }

        $scope.processCaffeine = function(){
            var coffeeData = [];
            var reversedCaffeine = angular.copy($scope.caffeine);
            reversedCaffeine.reverse();
            for(var i = 0; i < reversedCaffeine.length; i++) {
                if(reversedCaffeine[i]) {
                    for(var j = 0; j < reversedCaffeine[i].length; j++ ) {
                        var caffeineObj = {};
                        var drink = reversedCaffeine[i][j];

                        //if any caffeine entry is missing, simply ignore that caffeine input entirely
                        if(drink) {
                            if (drink.amount && drink.quantity && angular.isNumber(drink.hour) && angular.isNumber(drink.hour)) {
                                caffeineObj.dose = parseInt(drink.amount) * parseInt(drink.quantity);
                                caffeineObj.time = (parseInt(drink.hour) + 24 * i) + parseInt(drink.minute)/60;

                                coffeeData.push(caffeineObj);
                            }
                        }
                    }
                }
            }

            coffeeData.sort(function(a, b){
                a = a.time;
                b = b.time;

                return a - b;
            });

            var data = {
                doses: [],
                time: []
            };

            for(var k = 0; k < coffeeData.length; k++) {
                data.doses.push(coffeeData[k].dose);
                data.time.push(coffeeData[k].time)
            }

            return data;
        };

        $scope.validateData = function(){
            var output = {};
            var ok = false;
            var timeline = [];

            //expecting data format
            //{
            // “sleepStartTime”: 23,
            // “sleepWakeSchedule”:[ 8.0,40.0,8.0,12.0],
            // “caffeineDoses”:[ 100.0,200.0,100.0],
            // “caffeineTimes”:[ 32.0,48.0,51.0]
            // }
            var reversedSleeps = angular.copy($scope.sleeps);
            reversedSleeps.reverse();

            try {
                for(var i = 0; i < reversedSleeps.length; i++) {
                    var dataDay = [];
                    var day = reversedSleeps[i];

                    for(var j = 0; j < day.length; j++) {
                        var sleepObj = {};
                        sleepObj.start = day[j].startTime + 24 * 60 * i;
                        sleepObj.duration = day[j].durationTime;
                        sleepObj.end = sleepObj.start + day[j].durationTime;
                        sleepObj.dayID = $scope.numberOfDays - 1 - i;
                        sleepObj.slotID = j;

                        dataDay.push(sleepObj);
                    }

                    dataDay.sort(function(a, b){
                        a = a.start;
                        b = b.start;

                        return a - b;
                    });

                    var err = false;

                    //scan through dataday, if any overlapsed time, raise flag and bail out
                    for(var k = 1; k < dataDay.length; k ++) {
                        if(dataDay[k].start < dataDay[k-1].end) {
                            if($scope.errorDays.indexOf(dataDay[k].dayID) == -1) {
                                $scope.errorDays.push(dataDay[k].dayID);
                                err = true;
                                break;
                            }
                        }
                    }

                    if(!err) {
                        timeline[i] = dataDay;
                    }

                    if(err) {
                        throw new Error("Invalid Entry in sleep", "day " + (i+1));
                    }
                };
            } catch(e) {
                console.log(e.name+":  " + e.message);
            }

            if($scope.errorDays.length == 0) {      //checking day entries from the 2nd day
                try {
                    //checking the last element of timeline is an empty array (ie. users left the last day blank)
                    // then we assume that user stay up all the time, and the next sleep will be in the next day.
                    if(timeline[timeline.length -1].length == 0){
                        var lastDay = timeline.length -1;
                        var lastSleepObj = {};
                        lastSleepObj.start = 23 * 60 + 24 * 60 * (lastDay + 1);
                        lastSleepObj.duration = 8 * 60;
                        lastSleepObj.end = lastSleepObj.start + lastSleepObj.duration;
                        lastSleepObj.dayID = $scope.numberOfDays - lastDay -1;
                        lastSleepObj.slotID = 0;
                        timeline[timeline.length -1].push(lastSleepObj);
                    }

                    for(var i = 1; i < timeline.length; i ++) {
                        if(timeline[i -1].length && timeline[i].length) {
                            var prevLen = timeline[i - 1].length;

                            //check the end of the last slot of previous day with the beginning of the first slot
                            if(timeline[i -1][prevLen - 1].end > timeline[i][0].start) {
                                if($scope.errorDays.indexOf(i) == -1) {
                                    $scope.errorDays.push($scope.numberOfDays - 1 - i);
                                }
                                throw new Error("Invalid Entry in day" + (i +1));
                            }
                        }
                    }
                } catch(e) {
                    console.log(e.name+":  " + e.message);
                }

            }

            var output = {
                sleepStartTime: null,
                sleepWakeSchedule: [],
                caffeineDoses: [],
                caffeineTimes: [],
                numDays: $scope.numberOfDays
            };
            var sleepData = [];
            if($scope.errorDays.length == 0) {
                for(var j = 0; j < timeline.length; j++) {
                    for(var m = 0; m < timeline[j].length; m++) {
                        sleepData.push(timeline[j][m].start/60);
                        sleepData.push(timeline[j][m].duration/60);
                        sleepData.push(timeline[j][m].end/60);
                    }
                }

                var sData = [];

                output.sleepStartTime = sleepData[0];
                sleepData.shift();
                for(var a = 0; a < sleepData.length; a++) {
                    if(a % 3 == 1) {
                        if(a < sleepData.length - 1) {
                            var wake = sleepData[a+1] - sleepData[a];
                            sData.push(wake);
                        }
                    }
                    else if(a % 3 == 2) {
                        //do nothing
                        //console.log(sleepData[a]);
                    }
                    else {
                        sData.push(sleepData[a])
                    }
                }

                output.sleepWakeSchedule = sData;

                var drinks = $scope.processCaffeine();
                output.caffeineDoses = drinks.doses;
                output.caffeineTimes = drinks.time;
                ok = true;
            }
            else {
                //console.log($scope.sleepDays);
                //console.log($scope.errorDays);
                alert("Entry Error in  " + ($scope.sleepDays[$scope.errorDays[0]].toDateString()) + "!!!");
            }

            //not an ideal place to manipulate DOM here
            for(var i = 0; i < $scope.numberOfDays; i++) {
                if($scope.errorDays.indexOf(i) != -1) {
                    angular.element(document.querySelector("#day_title_" + i)).addClass("mycharge_error");
                }
                else {
                    angular.element(document.querySelector("#day_title_" + i)).removeClass("mycharge_error");
                }
            }

            //get the timestamp
            var lastDay = $scope.sleepDays[0];
            var ts = new Date(lastDay.getFullYear(), lastDay.getMonth(), lastDay.getDate() + 1, 0, 0, 0, 0);
            return {
                success: ok,
                data: output,
                rawData: {
                    sleeps: $scope.sleeps,
                    drinks: $scope.caffeine,
                    numberOfDays: $scope.numberOfDays,
                    sleepDays: $scope.sleepDays
                },
                timestamp: ts
            };
        };

        $scope.save = function() {
            var result = $scope.validateData();
            //console.log(result);
            if(result.success) {
                MyChargeService.setData(result, function(response){
                    $rootScope.renewPrediction = true;
                    $location.path("/chart");
                });
            }
            else {
                $scope.message = "Error in data";
            }
        };

        $scope.reset = function(){
            $scope.setDefaultData();
        };
    }
]);