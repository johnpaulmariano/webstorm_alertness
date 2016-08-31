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
})
.controller('MyChargeCalendarController', ['$scope', '$uibModal', 'moment', 'calendarConfig',
    'MyChargeDataService', function($scope, $uibModal, moment, calendarConfig, MyChargeDataService){
        var vm = this;

        //These variables MUST be set as a minimum for the calendar to work
        vm.calendarView = 'month';
        vm.viewDate = new Date();
        vm.isCellOpen = false;
        vm.startOpen = false;
        vm.endOpen = false;
        vm.eventsChangedState = false;

        vm.defaultStartSleep = 23;
        vm.defaultSleepDuration = 8;

        vm.sleeps = [];
        vm.caffeine = [];
        vm.message = "";
        vm.numberOfDays = 14;
        vm.sleepDays = [];

        vm.errorDays = [];

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
                        vm.events.push(
                            {
                                title: 'Sleep',
                                color: calendarConfig.colorTypes.warning,
                                startsAt: moment(myChargeEvents[i].tsStart).toDate(),
                                endsAt: moment(myChargeEvents[i].tsEnd).toDate(),
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
            for(var i = 0; i < calendarCell.events.length; i++) {
                if(calendarCell.events[i].dataType == 'sleep') {
                    if(calendarCell.events[i].startsAt > moment(calendarCell.date._d).startOf('day').toDate()) {
                        ok = false;
                        break;
                    }
                }
            }

            if(ok) {
                calendarCell.events.push(
                    {
                        title: 'Default Sleep',
                        color: calendarConfig.colorTypes.success,
                        startsAt: moment(calendarCell.date._d).add(vm.defaultStartSleep, 'hours').toDate(),
                        endsAt: moment(calendarCell.date._d).add(vm.defaultStartSleep + vm.defaultSleepDuration, 'hours').toDate(),
                        draggable: false,
                        resizable: false,
                        incrementsBadgeTotal: false,
                        allDay: true,
                        actions: sleepDefaultActions,
                        dataType: 'defaultSleep'
                    }
                );
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
            console.log(action);
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
                    console.log('closed');
                }, function(){
                    console.log('dismiss');
                }
            );
        };

        vm.toggle = function($event, field, event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope[field] = !$scope[field];
        };

        deleteEvent = function(action, event) {
            vm.events.splice(event.$id, 1);

            //do save events
            var data = [];
            for(var i = 0; i < $scope.vm.events.length; i++) {
                var singleEvent = null;
                if($scope.vm.events[i].cssClass != 'fake-event-class') {
                    if($scope.vm.events[i].dataType == 'sleep') {
                        singleEvent = {
                            tsEnd: $scope.vm.events[i].endsAt.getTime(),
                            tsStart: $scope.vm.events[i].startsAt.getTime(),
                            dataType: 'sleep'
                        }
                    }
                    else if($scope.vm.events[i].dataType == 'caffeine') {
                        singleEvent = {
                            tsStart: $scope.vm.events[i].startsAt.getTime(),
                            dataType: 'caffeine',
                            sourceID: $scope.vm.events[i].sourceID,
                            amount: $scope.vm.events[i].amount,
                            quantity: $scope.vm.events[i].quantity,
                            source: $scope.vm.events[i].name
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

            MyChargeDataService.transformData(data, function(response){
                if(response.success) {
                    console.log('transform success');
                }
            });
        }

        console.log($scope);
    }
]);