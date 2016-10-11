/**
 * Created by trieutran on 8/23/16.
 */
/**
 * Created by trieutran on 7/1/16.
 */
atoAlertnessControllers.controller('MyChargeCalendarModalController', ['$scope', '$uibModalInstance', 'calEvent', 'action',
    'eventType', 'events', 'calendarConfig', 'actionButtons', 'CaffeineService', 'MyChargeDataService', 'DEFAULT_SLEEP_END',
    'DEFAULT_SLEEP_START', 'DEFAULT_SLEEP_DURATION',
    function($scope, $uibModalInstance, calEvent, action, eventType, events, calendarConfig, actionButtons,
             CaffeineService, MyChargeDataService, DEFAULT_SLEEP_END, DEFAULT_SLEEP_START, DEFAULT_SLEEP_DURATION) {

        $scope.endOpen = false;
        $scope.startOpen = false;
        $scope.eventsChangedState = false;
        $scope.editMode = false;
        $scope.errorMessage = null;
        $scope.quantitySelected = 0;

        /**
        * create a object for duartion dropdown menu
        * @param {number} sel - The selected (or default selected) option in the dropdown menu
        */
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
                        txt: i + ' hr ' + j * 15 + ' min'
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

        /**
         *  set and unset flag
         *  @param $event - $event javascript object
         *  @param field - name of the flag
         */

        $scope.toggle = function($event, field){
            $event.preventDefault();
            $event.stopPropagation();
            $scope[field] = !$scope[field];

        };

        /**
         *  ok button click event handler
         *  depending on the dataType of an event, a validation function will be called
         *  and if data is valid, the scope level flag $scope.eventsChangedState is set to true
         *
         */
        $scope.ok = function(){
            if(calEvent.dataType == 'defaultSleep') {
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
                    sleepObj.title = (sleepObj.startsAt.getTime() != sleepObj.endsAt.getTime()) ? 'Sleep' : 'Zero Sleep';
                    sleepObj.cssClass= (sleepObj.startsAt.getTime() != sleepObj.endsAt.getTime()) ? 'has-sleep' : 'zero-sleep';;
                    $scope.vm.events.push(sleepObj);
                    $scope.eventsChangedState = true;
                }

                $uibModalInstance.close("Event Closed");

            }
            else if(calEvent.dataType == 'sleep') {
                var validation = $scope.validateSleep(calEvent);

                if(validation.ok) {
                    if($scope.editMode) {
                        calEvent.endsAt = moment(calEvent.startsAt).add($scope.durationSelected.ts, 'ms').toDate();
                        calEvent.title = (calEvent.startsAt.getTime() != calEvent.endsAt.getTime()) ? 'Sleep' : 'Zero Sleep';
                        calEvent.cssClass = (calEvent.startsAt.getTime() != calEvent.endsAt.getTime()) ? 'has-sleep' : 'zero-sleep';
                        //console.log(calEvent);
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
                        sleepObj.title = (sleepObj.startsAt.getTime() != sleepObj.endsAt.getTime()) ? 'Sleep' : 'Zero Sleep';
                        sleepObj.cssClass = (sleepObj.startsAt.getTime() != sleepObj.endsAt.getTime()) ? 'has-sleep' : 'zero-sleep';

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

                if(validation.ok) {
                    if(!$scope.editMode) {
                        //remove old event
                        //$scope.vm.events.splice(calEvent.$id, 1);
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
                    }

                    $scope.eventsChangedState = true;
                    $uibModalInstance.close("Event Closed");
                }
                else {
                    //display message somewhere
                    $scope.errorMessage = validation.message;
                }
            }
        }

        /**
         * validating a caffeine drink event
         * @param {object} cEvent - a calendar event
         * validation rules:
         *  - "quantity" must be selected and not 0
         *  - the start time of the caffeine event can neither overlap with existing sleep events
         *    nor overlap with a default sleep event
        * */
        $scope.validateCaffeine = function(cEvent) {
            console.log('validate caffeine');
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
                var output = {
                    ok: true
                };

                var zeroHour = moment(cEvent.startsAt).startOf('day').toDate().getTime();
                var lastDaySleepEnd = zeroHour + DEFAULT_SLEEP_END * 60 * 60 * 1000;
                var lastDaySleepStart = lastDaySleepEnd - DEFAULT_SLEEP_DURATION * 60 * 60 * 1000;
                var startSleepHour = zeroHour + DEFAULT_SLEEP_START * 60 * 60 * 1000;
                var nextDaySleepEnd = startSleepHour + DEFAULT_SLEEP_DURATION * 60 * 60 * 1000;
                var endOfDay = zeroHour + 24 * 60 * 60 * 1000;

                /*console.log(cEvent);
                console.log(moment(zeroHour).toDate());
                console.log(moment(startSleepHour).toDate());
                console.log(moment(lastDaySleepEnd).toDate());
                console.log(moment(nextDaySleepEnd).toDate());
                console.log(moment(endOfDay).toDate());*/

                //get an array of sleep events within time range of the caffeine event occurs only
                var sleepEvents = [];
                for(var i = 0; i < $scope.vm.events.length; i++) {
                    if($scope.vm.events[i].dataType == 'sleep'
                        && (($scope.vm.events[i].startsAt.getTime() <= zeroHour && $scope.vm.events[i].endsAt.getTime() >= zeroHour)
                        || ($scope.vm.events[i].startsAt.getTime() <= endOfDay && $scope.vm.events[i].endsAt.getTime() >= endOfDay))) {
                        sleepEvents.push($scope.vm.events[i]);
                    }
                }

                //console.log(sleepEvents);

                //if it is no sleep event within the time range, validate the caffeine against the default sleep time
                if(sleepEvents.length == 0) {
                    if((cEvent.startsAt.getTime() > lastDaySleepStart && cEvent.startsAt.getTime() < lastDaySleepEnd)
                    || (cEvent.startsAt.getTime() > startSleepHour && cEvent.startsAt.getTime() < endOfDay)){
                        output.message = " Conflict with an existing default sleep event";
                        output.ok = false;
                    }
                }
                else {
                    for(var j = 0; j < sleepEvents.length; j++) {
                        if(cEvent.startsAt.getTime() > sleepEvents[j].startsAt.getTime() && cEvent.startsAt.getTime() < sleepEvents[j].endsAt.getTime()) {
                            output.message = "Conflict with an existing sleep event";
                            output.ok = false;
                            break;
                        }
                    }

                    //run another checking with previous day sleep event
                    if(output.ok) {
                        if((cEvent.startsAt.getTime() > zeroHour && cEvent.startsAt.getTime() < lastDaySleepEnd)
                            || (cEvent.startsAt.getTime() > startSleepHour && cEvent.startsAt.getTime() < endOfDay)){
                            output.message = " Conflict with an existing default sleep event";
                            output.ok = false;
                        }
                    }
                }

                return output;
            }


        };

        /**
         * validating a sleep event
         * @param {object} cEvent - a calendar event
         * validation rules:
         *  - not overlaps with any other sleep events, ie.
         *      + start time must not in any sleep event's ending and start time
         *      + end time must not in any sleep event start and end time
         * */

        $scope.validateSleep = function(cEvent){
            console.log('validate sleep');
            var output = {
                ok: true
            };
            //console.log($scope.vm.events);
            //console.log(cEvent);

            cEvent.endsAt = moment(cEvent.startsAt).add($scope.durationSelected.ts, 'ms').toDate();

            for(var i = 0; i < $scope.vm.events.length; i++) {
                var sleepEvt = $scope.vm.events[i];
                if(sleepEvt.$id != cEvent.$id) {
                    if((cEvent.startAt >= sleepEvt.startsAt && cEvent.startsAt <= sleepEvt.endsAt)
                    || (cEvent.endsAt >= sleepEvt.startsAt && cEvent.endsAt <= sleepEvt.endsAt)) {
                        output.message = "Conflict with an existing sleep event";
                        output.ok = false;
                        break;
                    }
                }
            }

            //validate against caffeine vents
            if(output.ok) {
                var caffeineEvents = [];
                for(var i = 0; i < $scope.vm.events.length; i++) {
                    if($scope.vm.events[i].dataType == 'caffeine'
                        && ($scope.vm.events[i].startsAt >= cEvent.startsAt  && $scope.vm.events[i].startsAt <= cEvent.endsAt)) {
                        output.message = "Conflict with an existing caffeine event";
                        output.ok = false;
                        break;
                    }
                }
            }
            return output;
        }

        /**
        *   A watcher function to monitor the state of $scope.eventsChangedState
         *   Event data will be saved if the state set to true
         *   Note: all events' timestamps will be added 1 millisecond
        */
        $scope.$watch('eventsChangedState', function(newVal, oldVal){
            if(newVal == false) {
                console.log('not save');
            }
            else if(newVal == true) {
                console.log('save now');
                var data = [];

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
        });
    }
]);
