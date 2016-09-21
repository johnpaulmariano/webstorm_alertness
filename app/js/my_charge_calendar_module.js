//atoAlertnessMyChargeCalendarModule

var atoAlertnessMyChargeCalendarModule = angular.module('atoAlertnessMyChargeCalendarModule', ['mwl.calendar', 'ui.bootstrap']);
atoAlertnessMyChargeCalendarModule.config(function(calendarConfig) {

    //console.log(calendarConfig); //view all available config
    calendarConfig.templates.calendarSlideBox = './templates/calendar/calendarSlideBox.html';
    calendarConfig.templates.calendarMonthCell = './templates/calendar/calendarMonthCell.html';
    calendarConfig.templates.calendarMonthCellEvents = './templates/calendar/calendarMonthCellEvents.html';
    calendarConfig.templates.calendarMonthView = './templates/calendar/calendarMonthView.html';
    calendarConfig.dateFormatter = 'moment';
    calendarConfig.allDateFormats.moment.title.day = 'ddd D MMM';
    calendarConfig.allDateFormats.moment.date.weekDay  = 'ddd';
    calendarConfig.displayAllMonthEvents = true;
    calendarConfig.colorTypes.info = {
        primary: '#ed3c18',
        secondary: '#d1e8ff'
    };
})
.controller('MyChargeCalendarController', ['$scope', '$uibModal', 'moment', 'calendarConfig', 'MyChargeDataService',
    'DEFAULT_PREDICTION_DAYS', 'DEFAULT_SLEEP_START', 'DEFAULT_SLEEP_DURATION', 'DEFAULT_SLEEP_END',
    function($scope, $uibModal, moment, calendarConfig, MyChargeDataService, DEFAULT_PREDICTION_DAYS,
             DEFAULT_SLEEP_START, DEFAULT_SLEEP_DURATION, DEFAULT_SLEEP_END){
        var vm = this;

        vm.calendarView = 'month';
        vm.viewDate = new Date();
        vm.isCellOpen = false;
        //vm.startOpen = false;
        //vm.endOpen = false;
        vm.eventsChangedState = false;

        //vm.defaultStartSleep = DEFAULT_SLEEP_START;
       // vm.defaultSleepDuration = DEFAULT_SLEEP_DURATION;

        var sleepActions = [
            {
                label: '<i class=\'glyphicon glyphicon-remove\'></i>',
                onClick: function(args) {
                    deleteEvent('Delete-Sleep', args.calendarEvent);
                }
            },
            {
                label: '<i class=\'glyphicon glyphicon-pencil\'></i>',
                onClick: function(args) {
                    showModal('Edit-Sleep', args.calendarEvent);
                }
            }
        ];

        var sleepDefaultActions = [
            {
                label: '<i class=\'glyphicon glyphicon-remove\'></i>',
                onClick: function(args) {
                    deleteEvent('Delete-Sleep', args.calendarEvent);
                }
            },
            {
                label: '<i class=\'glyphicon glyphicon-pencil\'></i>',
                onClick: function(args) {
                    showModal('Edit-Sleep', args.calendarEvent);
                }
            }
        ];

        var caffeineActions = [
            {
                label: '<i class=\'glyphicon glyphicon-remove\'></i>',
                onClick: function(args) {
                    deleteEvent('Delete-Coffee', args.calendarEvent);
                }
            },
            {
                label: '<i class=\'glyphicon glyphicon-pencil\'></i>',
                onClick: function(args) {
                    showModal('Edit-Coffee', args.calendarEvent);
                }
            }
        ];

        var addActions = [
            {
                label: '<div class=\'btn btn-primary\'>+ Sleep</div>',
                onClick: function(args) {
                    showModal('Add-Sleep', args.calendarEvent);
                }
            },
            {
                label: '<div class=\'btn btn-primary\'>+ Caffeine</div>',
                onClick: function(args) {
                    showModal('Add-Coffee', args.calendarEvent);
                }
            }
        ];
        vm.events = [];

        MyChargeDataService.getData(function(response){
            if(response.success == true) {
                var myChargeEvents = response.data;

                for(var i = 0; i < myChargeEvents.length; i++){
                    if(myChargeEvents[i].dataType == 'sleep'){
                        var title = 'Sleep';

                        if(myChargeEvents[i].tsStart == myChargeEvents[i].tsEnd) {
                            title = 'Zero Sleep';
                        }
                        vm.events.push(
                            {
                                title: title,
                                color: calendarConfig.colorTypes.warning,
                                startsAt: moment.utc(myChargeEvents[i].tsStart).toDate(),
                                endsAt: moment.utc(myChargeEvents[i].tsEnd).toDate(),
                                //duration: myChargeEvents[i].tsEnd - myChargeEvents[i].tsStart,
                                //startAt: s,
                                //endsAt: e,
                                draggable: false,
                                resizable: false,
                                incrementsBadgeTotal: false,
                                allDay: false,
                                actions: sleepActions,
                                dataType: 'sleep'
                            }
                        );
                    }
                    else {
                        vm.events.push(
                            {
                                title: 'Caffeine',
                                color: calendarConfig.colorTypes.info,
                                startsAt: moment(myChargeEvents[i].tsStart).toDate(),
                                sourceID: myChargeEvents[i].sourceID,
                                amount: myChargeEvents[i].amount,
                                quantity: myChargeEvents[i].quantity,
                                draggable: false,
                                resizable: false,
                                incrementsBadgeTotal: false,
                                allDay: false,
                                actions: caffeineActions,
                                dataType: 'caffeine'
                            }
                        );
                    }
                }
            }
        });

        //adding default sleep events
        vm.modifyCell = function(calendarCell){
            var ok = true;
            //console.log(calendarCell.date._d);
            //console.log('****');
            var zeroHour = moment(calendarCell.date._d).startOf('day').toDate().getTime();
            /*var lastNightSleepStart = moment(zeroHour).subtract(1, 'days').add(DEFAULT_SLEEP_START, 'hours').toDate();
            var wakeupHour = moment(zeroHour).add(DEFAULT_SLEEP_END, 'hours').toDate();
            var startSleepHour = moment(zeroHour).startOf('day').add(DEFAULT_SLEEP_START, 'hours').toDate();
            var nextDaySleepEnd = moment(startSleepHour).add(DEFAULT_SLEEP_DURATION, 'hours').toDate();*/
            //var lastNightSleepStart = zeroHour + (-24 + DEFAULT_SLEEP_START) * 60 * 60 * 1000;
            //var wakeupHour = zeroHour + DEFAULT_SLEEP_END * 60 * 60 * 1000;
            var startSleepHour = zeroHour + DEFAULT_SLEEP_START * 60 * 60 * 1000 - 1;
            var nextDaySleepEnd = startSleepHour + DEFAULT_SLEEP_DURATION * 60 * 60 * 1000;
            //console.log('zz------------zzz');
            /*console.log(moment(zeroHour).toDate());
            console.log(startSleepHour);
            console.log(nextDaySleepEnd);*/


            for(var i = 0; i < vm.events.length; i++) {
                if(vm.events[i].dataType == 'sleep') {
                    /*console.log(vm.events[i]);
                    console.log('start at');
                    console.log(vm.events[i].startsAt.getTime());
                    console.log('end at');
                    console.log(vm.events[i].endsAt.getTime());*/
                    if((vm.events[i].endsAt.getTime() > startSleepHour && vm.events[i].endsAt.getTime() < nextDaySleepEnd)
                        || (vm.events[i].startsAt.getTime() < nextDaySleepEnd && vm.events[i].endsAt.getTime() > nextDaySleepEnd)
                        ) {
                        /*console.log('found');
                        console.log(vm.events[i]);
                        console.log('start at');
                        console.log(vm.events[i].startsAt.getTime());
                        console.log('end at');
                        console.log(vm.events[i].endsAt.getTime());

                        console.log('date');
                        console.log(calendarCell.date._d);
                        console.log('-------');*/
                        ok = false;
                        break;
                    }
                }
            }

            if(ok) {
                //console.log('ok here');
                calendarCell.events.push(
                    {
                        title: 'Default Sleep',
                        color: calendarConfig.colorTypes.success,
                        startsAt: moment(startSleepHour + 1).toDate(),
                        endsAt: moment(nextDaySleepEnd + 1).toDate(),
                        //duration: nextDaySleepEnd - startSleepHour,
                        draggable: false,
                        resizable: false,
                        incrementsBadgeTotal: false,
                        allDay: true,
                        actions: sleepDefaultActions,
                        dataType: 'defaultSleep'
                    }
                );
                //console.log(calendarCell);
            }
        };

        vm.fakeEventID = null;
        vm.fakeEventDate = null;
        //adding a fake event for containing two buttons
        vm.myOnTimespanClick = function(day){
            console.log(day.getTime());
            console.log(vm.isCellOpen);
            console.log(vm.fakeEventDate);
            if(!vm.isCellOpen) {
                vm.toggleFakeEvent(day, 'add');
                vm.fakeEventDate = day;
                vm.isCellOpen = true;
            }
            else {
                if(vm.fakeEventDate.getTime() == day.getTime()) {
                    vm.toggleFakeEvent(day, 'remove');
                    vm.isCellOpen = false;
                }
                else {
                    vm.toggleFakeEvent(vm.fakeEventDate, 'remove');
                    vm.toggleFakeEvent(day, 'add');
                    vm.fakeEventDate = day;
                    vm.isCellOpen = true;
                }
            }
        }

        vm.toggleFakeEvent = function(day, act) {
            if(act == 'add'){
                vm.events.push(
                    {
                        title: '',
                        color: calendarConfig.colorTypes.alert,
                        startsAt: moment(day).add(1, 'days').subtract(1, 'seconds').toDate(),
                        //duration: 0,
                        draggable: false,
                        resizable: false,
                        incrementsBadgeTotal: false,
                        allDay: true,
                        actions: addActions,
                        cssClass: 'fake-event-class'
                    }
                );

                vm.fakeEventID = vm.events.length - 1;
            }
            else if(act == 'remove'){  //remove the fake event
                vm.events.splice(vm.fakeEventID, 1);
            }
        }

        /*$scope.$watch('vm.events', function(newValue, oldValue){
            console.log('change events');
            console.log(newValue);
            console.log(oldValue);
            //console.log(vm.calendarDate);
        });*/


        showModal = function(action, event){
            //console.log(action);
            if(action == 'Edit-Sleep' || action == 'Add-Sleep') {
                var modalInstance = $uibModal.open({
                    //animation: vm.animationsEnabled,
                    windowTemplateUrl: './templates/modal/window.html',
                    templateUrl: 'sleepModal.html',
                    controller: 'MyChargeCalendarModalController',
                    backdrop: false,
                    size: 'small',
                    scope: $scope,
                    resolve: {
                        calEvent: function(){
                            return event;
                        },
                        eventType : function(){
                            return 'sleep';
                        },
                        action: function() {
                            return action;
                        },
                        events: function() {
                            return $scope.vm.events;
                        },
                        actionButtons: function() {
                            return sleepActions;
                        },
                        calendarConfig: function() {
                            return calendarConfig;
                        }
                    }
                });
            }
            else if(action == 'Edit-Coffee' || action == 'Add-Coffee') {
                var modalInstance = $uibModal.open({
                    //animation: vm.animationsEnabled,
                    windowTemplateUrl: './templates/modal/window.html',
                    templateUrl: 'caffeineModal.html',
                    controller: 'MyChargeCalendarModalController',
                    backdrop: false,
                    size: 'small',
                    scope: $scope,
                    resolve: {
                        calEvent: function(){
                            //console.log(event);
                            return event;
                        },
                        eventType : function(){
                            return 'caffeine';
                        },
                        action: function() {
                            return action;
                        },
                        events: function() {
                            return $scope.vm.events;
                        },
                        actionButtons: function() {
                            return caffeineActions;
                        },
                        calendarConfig: function() {
                            return calendarConfig;
                        }
                    }
                });
            }

            modalInstance.result.then(function (msg) {
                    vm.message = msg;
                    //console.log('closed');
                }, function(){
                    //console.log('dismiss');
                }
            );
        };

        /*vm.toggle = function($event, field, event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope[field] = !$scope[field];
        };*/

        deleteEvent = function(action, calEvent) {
            console.log(calEvent);

            //for default sleep event deletion: it would be create a new sleep event with the start sleep time equals to end sleep time
            if(calEvent.dataType == "defaultSleep") {
                console.log(vm.events);
                var newSleep = angular.copy(calEvent);
                console.log(newSleep);
                var startTime = newSleep.startsAt.getTime() + 1;
                newSleep.title = 'Zero Sleep';
                newSleep.color = calendarConfig.colorTypes.warning;
                newSleep.startsAt = moment(startTime).toDate();
                newSleep.endsAt = moment(startTime).toDate();
                newSleep.actions = sleepActions;
                newSleep.dataType = 'sleep';
                vm.events.push(newSleep);

                console.log(vm.events);
            }
            else {  //for other types, it would be slice the event out of the events array

                for (var i = 0; i < vm.events.length; i++) {
                    if (i == calEvent.$id) {
                        vm.events.splice(i, 1);
                    }
                }
            }

            //save events
            var data = [];
            for(var i = 0; i < vm.events.length; i++) {
                var singleEvent = null;
                if(vm.events[i].cssClass != 'fake-event-class') {
                    if(vm.events[i].dataType == 'sleep') {
                        singleEvent = {
                            tsEnd: vm.events[i].endsAt.getTime(),
                            tsStart: vm.events[i].startsAt.getTime(),
                            dataType: 'sleep'
                        }
                    }
                    else if(vm.events[i].dataType == 'caffeine') {
                        singleEvent = {
                            tsStart: vm.events[i].startsAt.getTime(),
                            dataType: 'caffeine',
                            sourceID: vm.events[i].sourceID,
                            amount: vm.events[i].amount,
                            quantity: vm.events[i].quantity,
                            source: vm.events[i].name
                        }
                    }
                }

                if(singleEvent != null) {
                    data.push(singleEvent);
                }
            }

            MyChargeDataService.setData(data, function(response){
                if(response.success) {
                    console.log('saved');
                }
            });
        }

        vm.reset= function() {
            console.log('reset data');
            vm.events = [];
            MyChargeDataService.setData([], function(response){
                if(response.success) {
                    console.log('data erased');
                }
            });
        };
    }
]);