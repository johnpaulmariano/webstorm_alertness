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
.controller('MyChargeCalendarController', ['$uibModal', 'moment', 'calendarConfig', 'MyChargeDataService',
    function($uibModal, moment, calendarConfig, MyChargeDataService){
        var vm = this;
        console.log(vm);
        //These variables MUST be set as a minimum for the calendar to work
        vm.calendarView = 'month';
        vm.viewDate = new Date();
        vm.isCellOpen = false;
        vm.startOpen = false;
        vm.endOpen = false;

        vm.sleeps = [];
        vm.caffeine = [];
        vm.message = "";
        vm.numberOfDays = 14;
        vm.sleepDays = [];
        vm.defaultStartSleepHour = 23;
        vm.defaultStartSleepMinute = 0;
        vm.defaultDurationHour = 8;
        vm.defaultDurationMinute = 0;
        vm.errorDays = [];

        var sleepActions = [
            {
                label: '<i class=\'glyphicon glyphicon-pencil\'></i>',
                onClick: function(args) {
                    showModal('Edit-Sleep', args.calendarEvent);
                }
            },
            {
                label: '<i class=\'glyphicon glyphicon-remove\'></i>',
                onClick: function(args) {
                    showModal('Delete-Sleep', args.calendarEvent);
                }
            }
        ];

        var sleepDefaultActions = [
            {
                label: '<i class=\'glyphicon glyphicon-pencil\'></i>',
                onClick: function(args) {
                    showModal('Edit-Sleep', args.calendarEvent);
                }
            },
            {
                label: '<i class=\'glyphicon glyphicon-remove\'></i>',
                onClick: function(args) {
                    showModal('Delete-Sleep', args.calendarEvent);
                }
            }
        ];

        var caffeineActions = [
            {
                label: '<i class=\'glyphicon glyphicon-pencil\'></i>',
                onClick: function(args) {
                    showModal('Edit-Coffee', args.calendarEvent);
                }
            },
            {
                label: '<i class=\'glyphicon glyphicon-remove\'></i>',
                onClick: function(args) {
                    showModal('Delete-Coffee', args.calendarEvent);
                }
            }
        ];

        var addActions = [
            {
                label: '<i class=\'glyphicon glyphicon-plus\'>Sleep</i>',
                onClick: function(args) {
                    showModal('Add-Sleep', args.calendarEvent);
                }
            },
            {
                label: '<i class=\'glyphicon glyphicon-plus\'>Caffeine</i>',
                onClick: function(args) {
                    showModal('Add-Coffee', args.calendarEvent);
                }
            }
        ];
        vm.events = [];

        MyChargeDataService.getData(function(response){
            if(response.success == true) {
                var myChargeEvents = response.data;
                console.log(myChargeEvents);

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
                        startsAt: moment(calendarCell.date._d).add(23, 'hours').toDate(),
                        endsAt: moment(calendarCell.date._d).add(1, 'days').add(7, 'hours').toDate(),
                        draggable: false,
                        resizable: false,
                        incrementsBadgeTotal: false,
                        allDay: true,
                        actions: sleepDefaultActions,
                        dataType: 'sleep'
                    }
                );
            }

        };

        console.log(vm.events);

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
                    console.log('bye');
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

        /*$scope.$watch('vm.isCellOpen', function(newValue, oldValue){
            console.log(newValue);
            console.log(oldValue);
            console.log(vm.calendarDate);
        });*/
        /*

        vm.eventEdited = function(event) {
            showModal('Edited', event);
        };

        vm.eventDeleted = function(event) {
            showModal('Deleted', event);
        };

        vm.eventTimesChanged = function(event) {
            showModal('Dropped or resized', event);
        };*/


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
                    resolve: {
                        calEvent: function(){
                            //console.log(event);
                            return event;
                        },
                        eventType : function(){
                            return 'sleep';
                        },
                        action: function() {
                            return action;
                        }
                    }
                });

                modalInstance.opened.then(function(){

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
                    resolve: {
                        calEvent: function(){
                            console.log(event);
                            return event;
                        },
                        eventType : function(){
                            return 'caffeine';
                        },
                        action: function() {
                            return action;
                        }
                    }
                });
            }

            modalInstance.result.then(function (msg) {
                    vm.message = msg;
                }, function(){
                }
            );
        };

        //vm.toggle = function($event, field, event) {
        vm.toggle = function($event, field, event) {
            console.log("toggle " + field);
            $event.preventDefault();
            $event.stopPropagation();

            //event[field] = !event[field];
            $scope[field] = !$scope[field];
        };


        console.log(vm);

    }
]);