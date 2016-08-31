/**
 * Created by trieutran on 8/23/16.
 */
/**
 * Created by trieutran on 7/1/16.
 */
atoAlertnessControllers.controller('MyChargeCalendarModalController', ['$scope', '$uibModalInstance', 'calEvent', 'action',
    'eventType', 'events', 'calendarConfig', 'actionButtons', 'CaffeineService', 'MyChargeDataService',
    function($scope, $uibModalInstance, calEvent, action, eventType, events, calendarConfig, actionButtons,
             CaffeineService, MyChargeDataService) {

        $scope.endOpen = false;
        //$scope.events = events;
        $scope.eventsChangedState = false;
        $scope.editMode = false;

        switch (action) {
            case 'Edit-Sleep':
                $scope.modalTitle = 'Edit Sleep';
                $scope.editMode = true;
                break;

            case 'Add-Sleep':
                $scope.modalTitle = 'Add Sleep';
                calEvent.dataType = 'sleep';
                calEvent.startsAt = moment(calEvent.startsAt).startOf('day').toDate();
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
            $scope.oldStartsAt = calEvent.startsAt;
            $scope.oldEndsAt = calEvent.endsAt;
        }

        $scope.cancel = function () {

            if(eventType == 'sleep') {
                calEvent.startsAt = $scope.oldStartsAt;
                calEvent.endsAt = $scope.oldEndsAt;
            }
            else if(eventType == 'caffeine') {
                calEvent.startsAt = $scope.oldStartsAt;
            }

            $uibModalInstance.dismiss('cancel');
        };

        $scope.toggle = function($event, field){
            $event.preventDefault();
            $event.stopPropagation(); // This is the magic

            $scope[field] = !$scope[field];
        };

        $scope.ok = function(){
            console.log('it is ok');
            if(calEvent.dataType == 'defaultSleep') {
                $scope.vm.events.push(
                    {
                        title: 'Sleep',
                        color: calendarConfig.colorTypes.warning,
                        startsAt: calEvent.startsAt,
                        endsAt: calEvent.endsAt,
                        draggable: false,
                        resizable: false,
                        incrementsBadgeTotal: false,
                        allDay: false,
                        actions: actionButtons,
                        dataType: 'sleep'
                    }
                );

                $scope.eventsChangedState = true;
            }
            else if(calEvent.dataType == 'sleep') {
                console.log('sleep ');

                if(!$scope.editMode) {
                    $scope.vm.events.push(
                        {
                            title: 'Sleep',
                            color: calendarConfig.colorTypes.warning,
                            startsAt: calEvent.startsAt,
                            endsAt: calEvent.endsAt,
                            draggable: false,
                            resizable: false,
                            incrementsBadgeTotal: false,
                            allDay: false,
                            actions: actionButtons,
                            dataType: 'sleep'
                        }
                    );
                }
                $scope.eventsChangedState = true;
            }
            else if(calEvent.dataType == 'caffeine') {
                if(!$scope.editMode) {
                    //var cloneEvent = angular.copy($scope.calEvent);
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
                    console.log(cloneEvent);
                    $scope.vm.events.push(cloneEvent);
                }


                $scope.eventsChangedState = true;
            }

            $uibModalInstance.close("Event Saved");
        }

        $scope.validateSleep = function(){
            var ok = true;

            return ok;
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
                                source: CaffeineService.getItem($scope.vm.events[i].sourceID).itemName
                            }
                        }
                    }
                    console.log('single event');
                    console.log(singleEvent);
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
        });
    }
]);
