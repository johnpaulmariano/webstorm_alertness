//atoAlertnessMyChargeCalendarModule

var atoAlertnessMyChargeCalendarModule = angular.module('atoAlertnessMyChargeCalendarModule', ['mwl.calendar', 'ui.bootstrap']);
atoAlertnessMyChargeCalendarModule.config(function(calendarConfig) {

    console.log(calendarConfig); //view all available config
    calendarConfig.templates.calendarSlideBox = './templates/calendar/calendarSlideBox.html';
    calendarConfig.templates.calendarMonthCell = './templates/calendar/calendarMonthCell.html';
    calendarConfig.templates.calendarMonthCellEvents = './templates/calendar/calendarMonthCellEvents.html';
    calendarConfig.templates.calendarMonthView = './templates/calendar/calendarMonthView.html';

})
.controller('MyChargeCalendarController', ['$scope', '$uibModal', 'moment', 'calendarConfig', 'SleepDataService', 'CaffeineDataService',
    function($scope, $uibModal, moment, calendarConfig, SleepDataService, CaffeineDataService){
        
        //These variables MUST be set as a minimum for the calendar to work
        $scope.calendarView = 'month';
        $scope.viewDate = new Date();
        $scope.isCellOpen = false;
        $scope.startOpen = false;
        $scope.endOpen = false;

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
        $scope.events = [];

        SleepDataService.getData(function(response){
            if(response.success == true) {
                var sleepEvents = response.data;
                console.log(sleepEvents);

                for(var i = 0; i < sleepEvents.length; i++){
                    $scope.events.push(
                        {
                            title: 'Sleep',
                            color: calendarConfig.colorTypes.warning,
                            startsAt: moment(sleepEvents[i].tsStart).toDate(),
                            endsAt: moment(sleepEvents[i].tsEnd).toDate(),
                            draggable: false,
                            resizable: false,
                            incrementsBadgeTotal: false,
                            allDay: false,
                            actions: sleepActions
                        }
                    );
                }
            }
        });

        CaffeineDataService.getData(function(response){
            if(response.success == true) {
                var caffeineEvents = response.data;
                console.log(caffeineEvents);

                for(var i = 0; i < caffeineEvents.length; i++){
                    $scope.events.push(
                        {
                            title: 'Caffeine',
                            color: calendarConfig.colorTypes.info,
                            startsAt: moment(caffeineEvents[i].tsStart).toDate(),
                            draggable: false,
                            resizable: false,
                            incrementsBadgeTotal: false,
                            allDay: false,
                            actions: caffeineActions
                        }
                    );
                }
            }
        });

        //var caffeineEvents = CaffeineDataService.getData();



        console.log($scope.events);
        /*$scope.events = [
            {
                title: 'Sleep',
                color: calendarConfig.colorTypes.warning,
                startsAt: moment().startOf('day').add(23, 'hours').toDate(),
                endsAt: moment().startOf('day').add(1, 'day').add(7, 'hours').toDate(),
                draggable: false,
                resizable: false,
                incrementsBadgeTotal: false,
                allDay: false,
                actions: sleepActions,
                tsStart: moment().startOf('day').add(23, 'hours').valueOf(),
                tsEnd: moment().startOf('day').add(1, 'day').add(7, 'hours').valueOf()
            },
            {
                title: 'Caffeine',
                color: calendarConfig.colorTypes.info,
                startsAt: moment().startOf('month').add(10, 'hour').toDate(),
                //endsAt: moment().startOf('month').add(1, 'day').add(7, 'hours').toDate(),
                draggable: false,
                resizable: false,
                incrementsBadgeTotal: false,
                allDay: false,
                actions: caffeineActions,
                tsStart: moment().startOf('month').add(10, 'hour').valueOf()
                //tsEnd: moment().startOf('day').add(1, 'day').add(7, 'hours').valueOf()
            },
            {
                title: 'Sleep',
                color: calendarConfig.colorTypes.warning,
                startsAt: moment().startOf('month').add(23, 'hour').toDate(),
                endsAt: moment().startOf('month').add(1, 'day').add(7, 'hours').toDate(),
                draggable: false,
                resizable: false,
                incrementsBadgeTotal: false,
                allDay: false,
                actions: sleepActions,
                tsStart: moment().startOf('month').add(23, 'hours').valueOf(),
                tsEnd: moment().startOf('month').add(1, 'day').add(7, 'hours').valueOf()
            }


        ];*/

        /*var test = [
            {
                tsStart: moment().startOf('day').add(23, 'hours').valueOf(),
                tsEnd: moment().startOf('day').add(1, 'day').add(7, 'hours').valueOf()
            },
            {
                tsStart: moment().startOf('month').add(10, 'hour').valueOf()
                //tsEnd: moment().startOf('day').add(1, 'day').add(7, 'hours').valueOf()
            },
            {
                tsStart: moment().startOf('month').add(23, 'hours').valueOf(),
                tsEnd: moment().startOf('month').add(1, 'day').add(7, 'hours').valueOf()
            }
        ];
        ;*/
        /*$scope.dateClicked = function(d){
            alert('hi ');
            console.log(d);
            //$event.stopPropagation();
            //$event.preventDefault();
            //$event.stopPropagation();

            $scope.isCellOpen = !$scope.isCellOpen;
        };*/



        $scope.addEvent = function() {
            $scope.events.push({
                title: 'New event',
                startsAt: moment().startOf('day').toDate(),
                endsAt: moment().endOf('day').toDate(),
                color: calendarConfig.colorTypes.important,
                //draggable: true,
                //resizable: true
            });
        };

        /*$scope.eventClicked = function(event) {
            showModal('Clicked', event);
        };

        $scope.eventEdited = function(event) {
            showModal('Edited', event);
        };

        $scope.eventDeleted = function(event) {
            showModal('Deleted', event);
        };

        $scope.eventTimesChanged = function(event) {
            showModal('Dropped or resized', event);
        };*/

        showModal = function(action, event){
            console.log(action);
            if(action == 'Edit-Sleep') {
                var modalInstance = $uibModal.open({
                    //animation: $scope.animationsEnabled,
                    windowTemplateUrl: './templates/modal/window.html',
                    templateUrl: 'sleepModal.html',
                    controller: 'MyChargeCalendarModalController',
                    backdrop: false,
                    size: 'small',
                    resolve: {
                        modalTitle: function(){
                            return 'Edit Sleep';
                        },
                        calEvent: function(){
                            console.log(event);
                            return event;
                        }
                    }
                });
            }
            else if(action == 'Edit-Coffee') {
                var modalInstance = $uibModal.open({
                    //animation: $scope.animationsEnabled,
                    windowTemplateUrl: './templates/modal/window.html',
                    templateUrl: 'caffeineModal.html',
                    controller: 'MyChargeCalendarModalController',
                    backdrop: false,
                    size: 'small',
                    resolve: {
                        modalTitle: function(){
                            return 'Edit Caffeine';
                        },
                        calEvent: function(){
                            console.log(event);
                            return event;
                        }
                    }
                });
            }



            modalInstance.result.then(function (msg) {
                    $scope.message = msg;
                }, function(){
                }
            );
        };

        //$scope.toggle = function($event, field, event) {
        $scope.toggle = function($event, field, event) {
            console.log("toggle " + field);
            $event.preventDefault();
            $event.stopPropagation();

            //event[field] = !event[field];
            $scope[field] = !$scope[field];
        };
    }
]);