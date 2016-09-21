/**
 * Created by trieutran on 8/23/16.
 */
/**
 * Created by trieutran on 7/1/16.
 */
atoAlertnessControllers.controller('MyChargeCalendarModalController', ['$scope', '$uibModalInstance', 'calEvent', 'action',
    'eventType', 'events', 'calendarConfig', 'actionButtons', 'CaffeineService', 'MyChargeDataService', 'DEFAULT_SLEEP_END',
    function($scope, $uibModalInstance, calEvent, action, eventType, events, calendarConfig, actionButtons,
             CaffeineService, MyChargeDataService, DEFAULT_SLEEP_END) {

        $scope.endOpen = false;
        $scope.startOpen = false;
        //$scope.events = events;
        $scope.eventsChangedState = false;
        $scope.editMode = false;
        $scope.errorMessage = null;
        $scope.quantitySelected = 0;

        //making sleep duration dropdown
        /*var twoDigitsFormat = function(digit) {
            if(digit < 10) {
                return "0" + digit;
            }
            else {
                return digit;
            }
        };*/

        var makeSleepDuration = function(sel) {
            var durations = [];
            var selectedObj = {
                ts: 0,
                txt: "00:00"
            };

            for (var i = 0; i < 24; i++) {
                for(var j = 0; j < 4; j++){
                    var ts = i * 60 * 60 * 1000 + j * 15 * 60 * 1000;
                    var ele = {
                        ts: ts,
                        txt: i + ' hr(s) ' + j * 15 + ' min(s)'
                    };

                    if(ts == sel) {
                        selectedObj = ele;
                    }

                    durations.push(ele);
                }

            }

            return {
                durations: durations,
                selected: selectedObj
            };
        }

        var durationObj = makeSleepDuration(calEvent.endsAt - calEvent.startsAt);
        $scope.sleepDurations = durationObj.durations;
        $scope.durationSelected = durationObj.selected;

        console.log(calEvent);

        switch (action) {
            case 'Edit-Sleep':
                $scope.modalTitle = 'Edit Sleep';
                $scope.editMode = true;
                break;

            case 'Add-Sleep':
                $scope.modalTitle = 'Add Sleep';
                calEvent.dataType = 'sleep';
                calEvent.startsAt = moment(calEvent.startsAt).startOf('day').add(23, 'hours').toDate();
                calEvent.endsAt = moment(calEvent.startsAt).startOf('day').add(1, 'days').add(DEFAULT_SLEEP_END, 'hours').toDate();
                break;

            case 'Edit-Coffee':
                $scope.modalTitle = 'Edit Caffeine Drink';
                $scope.editMode = true;
                break;

            case 'Add-Coffee':
                $scope.modalTitle = 'Add Caffeine Drink';
                calEvent.dataType = 'caffeine';
                calEvent.startsAt = moment(calEvent.startsAt).startOf('day').toDate();
                break;
        }

        $scope.calEvent = calEvent;
        //console.log($scope.calEvent);

        if(eventType == 'caffeine'){
            $scope.caffeineItems = CaffeineService.getData();

            $scope.quantity = [];
            for(var i = 1; i <= 10; i++) {
                $scope.quantity.push(i);
            }

            $scope.quantitySelected = 0;

            if(angular.isNumber(calEvent.sourceID)) {
                $scope.caffeineSelected = CaffeineService.getItem(calEvent.sourceID);
            }
            else{
                $scope.caffeineSelected = $scope.caffeineItems[0];
            }

            if(angular.isNumber(calEvent.quantity)) {
                $scope.quantitySelected = calEvent.quantity;
            }

            $scope.oldStartsAt = calEvent.startsAt;
        }
        else if(eventType == 'sleep' || eventType == 'defaultSleep') {
            //console.log('hi');
            $scope.oldStartsAt = calEvent.startsAt;
            //$scope.oldDuration = calEvent.endsAt;
            //console.log($scope.calEvent);
        }

        $scope.cancel = function () {

            if(eventType == 'sleep') {
                calEvent.startsAt = $scope.oldStartsAt;
                //calEvent.endsAt = $scope.oldEndsAt;
            }
            else if(eventType == 'caffeine') {
                calEvent.startsAt = $scope.oldStartsAt;
            }

            $uibModalInstance.dismiss('cancel');
        };

        $scope.toggle = function($event, field){
            //console.log('toggle calendar');
            //console.log(field);

            $event.preventDefault();
            $event.stopPropagation();
            $scope[field] = !$scope[field];

        };

        $scope.ok = function(){
            console.log('it is ok function');
            console.log(calEvent);

            if(calEvent.dataType == 'defaultSleep') {
                //calEvent.duration = $scope.durationSelected.ts;
                //var validation = $scope.validateSleep();
                //console.log(validation);
                //console.log(moment(calEvent.startsAt));
                var validation = $scope.validateSleep(calEvent);
                if(validation.ok) {
                    var sleepObj = {
                        color: calendarConfig.colorTypes.warning,
                        startsAt: calEvent.startsAt,
                        endsAt: moment(calEvent.startsAt).add($scope.durationSelected.ts, 'ms').toDate(),
                        draggable: false,
                        resizable: false,
                        incrementsBadgeTotal: false,
                        allDay: false,
                        actions: actionButtons,
                        dataType: 'sleep'
                    };
                    sleepObj.title = (sleepObj.startsAt != sleepObj.endsAt) ? 'Sleep' : 'Zero Sleep ';

                    $scope.vm.events.push(sleepObj);
                    $scope.eventsChangedState = true;
                }

                $uibModalInstance.close("Event Closed");

            }
            else if(calEvent.dataType == 'sleep') {
                //console.log('sleep ');
                //calEvent.duration = $scope.durationSelected.ts;
                var validation = $scope.validateSleep(calEvent);
                console.log(validation);

                if(validation.ok) {
                    if($scope.editMode) {
                        //remove old event
                        //$scope.vm.events.splice(calEvent.$id, 1);
                        calEvent.endsAt = moment(calEvent.startsAt).add($scope.durationSelected.ts, 'ms').toDate();
                        calEvent.title = (calEvent.startsAt != calEvent.endsAt) ? 'Sleep' : 'Zero Sleep ';
                    }
                    else {
                        var sleepObj = {
                            color: calendarConfig.colorTypes.warning,
                            startsAt: calEvent.startsAt,
                            endsAt: moment(calEvent.startsAt).add($scope.durationSelected.ts, 'ms').toDate(),
                            draggable: false,
                            resizable: false,
                            incrementsBadgeTotal: false,
                            allDay: false,
                            actions: actionButtons,
                            dataType: 'sleep'
                        };
                        sleepObj.title = (sleepObj.startsAt != sleepObj.endsAt) ? 'Sleep' : 'Zero Sleep ';

                        $scope.vm.events.push(sleepObj);
                    }

                    $scope.eventsChangedState = true;
                    $uibModalInstance.close("Event Closed");
                }
                else {
                    //display message somewhere
                    $scope.errorMessage = validation.message;
                }

            }
            else if(calEvent.dataType == 'caffeine') {
                var validation = $scope.validateCaffeine(calEvent);
                console.log('coffee here');
                console.log(validation);
                if(validation.ok) {
                    if($scope.editMode) {
                        //remove old event
                        $scope.vm.events.splice(calEvent.$id, 1);
                    }

                    var cloneEvent = {};
                    cloneEvent.startsAt = $scope.calEvent.startsAt;
                    cloneEvent.draggable = false;
                    cloneEvent.resizable = false;
                    cloneEvent.incrementsBadgeTotal = false;
                    cloneEvent.allDay = false;
                    cloneEvent.title = 'Caffeine';
                    cloneEvent.color = calendarConfig.colorTypes.info;
                    cloneEvent.sourceID = $scope.caffeineSelected.id;
                    cloneEvent.source = $scope.caffeineSelected.itemName;
                    cloneEvent.amount = parseInt($scope.caffeineSelected.value) * $scope.quantitySelected;
                    cloneEvent.quantity = $scope.quantitySelected;
                    cloneEvent.actions = actionButtons;
                    cloneEvent.dataType = 'caffeine';
                    //console.log(cloneEvent);
                    $scope.vm.events.push(cloneEvent);

                    $scope.eventsChangedState = true;
                    $uibModalInstance.close("Event Closed");
                }
                else {
                    //display message somewhere
                    $scope.errorMessage = validation.message;
                }
            }
        }

        $scope.validateCaffeine = function(cEvent) {
            if(!angular.isNumber($scope.quantitySelected)){
                return {
                    message: "Please select Quantity",
                    ok: false
                };
            }
            else if($scope.quantitySelected == 0) {
                return {
                    message: "Please select Quantity",
                    ok: false
                };
            }
            else {
                for(var i = 0; i < $scope.vm.events.length; i++) {
                    if(cEvent.startAt >= sleepEvt.startsAt && cEvent.startsAt <= sleepEvt.endsAt) {
                        output.message = "Conflict between caffeine drink time and sleep time";
                        output.ok = false;
                        break;
                    }
                }
            }


        };

        $scope.validateSleep = function(cEvent){
            console.log('validate sleep');
            var output = {
                ok: true
            };
            //console.log($scope.vm.events);
            //console.log(cEvent);

            cEvent.endsAt = moment(cEvent.startsAt).add($scope.durationSelected.ts, 'ms').toDate();

            //- not overlapse with any other sleep events
            //    + start time must not in any sleep event's ending and start time
               // + end time must not in any sleep event start and end time
            for(var i = 0; i < $scope.vm.events.length; i++) {
                var sleepEvt = $scope.vm.events[i];
                if(sleepEvt.$id != cEvent.$id) {
                    if((cEvent.startAt >= sleepEvt.startsAt && cEvent.startsAt <= sleepEvt.endsAt)
                    || (cEvent.endsAt >= sleepEvt.startsAt && cEvent.endsAt <= sleepEvt.endsAt)) {
                        output.message = "Conflict in sleep event time";
                        output.ok = false;
                        break;
                    }

                    /*if(cEvent.endsAt >= sleepEvt.startsAt && cEvent.endsAt <= sleepEvt.endsAt) {
                        output.message = "Conflict in sleep event end time";
                        output.ok = false;
                        break;
                    }*/
                }
            }

            return output;
        }

        $scope.$watch('eventsChangedState', function(newVal, oldVal){
            if(newVal == false) {
                console.log('not save');
            }
            else if(newVal == true) {
                console.log('save now');
                var data = [];
                console.log($scope.vm.events);

                for(var i = 0; i < $scope.vm.events.length; i++) {
                    var singleEvent = null;
                    if($scope.vm.events[i].cssClass != 'fake-event-class') {

                        var tsStart = $scope.vm.events[i].startsAt.getTime();
                        if( tsStart % 1000 == 0) {  //make sure timestamp always start at plus 1 millisecond
                            tsStart ++;
                        }

                        if($scope.vm.events[i].dataType == 'sleep') {
                            var tsEnd = $scope.vm.events[i].endsAt.getTime();
                            if( tsEnd % 1000 == 0) {    //make sure timestamp always start at plus 1 millisecond
                                tsEnd ++;
                            }
                            singleEvent = {
                                tsEnd: tsEnd,
                                endTime: $scope.vm.events[i].endsAt,
                                tsStart: tsStart,
                                startTime: $scope.vm.events[i].startsAt,
                                dataType: 'sleep'
                            }
                        }
                        else if($scope.vm.events[i].dataType == 'caffeine') {
                            singleEvent = {
                                tsStart: tsStart,
                                dataType: 'caffeine',
                                sourceID: $scope.vm.events[i].sourceID,
                                amount: $scope.vm.events[i].amount,
                                quantity: $scope.vm.events[i].quantity,
                                source: CaffeineService.getItem($scope.vm.events[i].sourceID).itemName
                            }
                        }
                    }
                    //console.log('single event');
                    //console.log(singleEvent);
                    if(singleEvent != null) {
                        data.push(singleEvent);
                    }


                }

                MyChargeDataService.setData(data, function(response){
                    if(response.success) {
                        console.log('saved');
                    }
                });

                /*MyChargeDataService.transformData(null, null, data, function(response){
                    if(response.success) {
                        console.log('transform success');
                    }
                });*/
            }
        });
    }
]);
