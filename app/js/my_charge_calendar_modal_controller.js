/**
 * Created by trieutran on 8/23/16.
 */
/**
 * Created by trieutran on 7/1/16.
 */
atoAlertnessControllers.controller('MyChargeCalendarModalController', ['$scope', '$uibModalInstance', 'calEvent', 'action', 'eventType', 'CaffeineService',
    function($scope, $uibModalInstance, calEvent, action, eventType, CaffeineService) {

        $scope.endOpen = false;

        switch (action) {
            case 'Edit-Sleep':
                $scope.modalTitle = 'Edit Sleep';
                break;

            case 'Add-Sleep':
                $scope.modalTitle = 'Add Sleep';
                break;

            case 'Edit-Coffee':
                $scope.modalTitle = 'Edit Caffeine Drink';
                break;

            case 'Add-Coffee':
                $scope.modalTitle = 'Add Caffeine Drink';
                break;
        }

        $scope.calEvent = calEvent;

        console.log($scope.calEvent);

        if(eventType == 'caffeine'){
            $scope.caffeineItems = CaffeineService.getData();

            $scope.quantity = [];
            for(var i = 1; i <= 10; i++) {
                $scope.quantity.push(i);
            }

            $scope.quantitySelected = 0;

            if(angular.isNumber(calEvent.sourceID)) {
                $scope.caffeineSelected = CaffeineService.getItem(calEvent.sourceID);
                console.log($scope.caffeineSelected);
            }
            else{
                $scope.caffeineSelected = $scope.caffeineItems[0];
            }

            if(angular.isNumber(calEvent.quantity)) {
                $scope.quantitySelected = calEvent.quantity;
            }

            $scope.oldStartsAt = calEvent.startsAt;
        }
        else if(eventType == 'sleep') {
            ///$scope.calEvent.duration = moment.duration(calEvent.endsAt - calEvent.startsAt);
            console.log($scope.calEvent);

            $scope.oldStartsAt = calEvent.startsAt;
            $scope.oldEndsAt = calEvent.endsAt;
            //angular.copy(calEvent.endsAt, $scope.endsAt);
            //$scope.endsAt = calEvent.endsAt;
        }


        /*$scope.dropdowns = dropdowns;
        $scope.sleeps = sleeps;
        $scope.errorDays = errorDays;
        $scope.dayDropdowns = dayDropdowns;
        $scope.sleepDays = sleepDays;
        $scope.currentDay = {
            txt: $scope.sleepDays[$scope.sleepDays.length - 1].toDateString(),
            val: $scope.sleepDays.length - 1
        };

        $scope.ok = function () {

            //add to sleeps array
            var startTime = dropdowns.selStartHour.val * 60 + dropdowns.selStartMin.val;
            var durationTime = dropdowns.selDurationHour.val * 60 + dropdowns.selDurationMin.val;
            var endTime = startTime + durationTime;
            $scope.errorDays = [];
            $scope.sleeps[$scope.currentDay.val].push(
                {
                    startHour: dropdowns.selStartHour.val,
                    startMinute: dropdowns.selStartMin.val,
                    durationHour: dropdowns.selDurationHour.val,
                    durationMinute: dropdowns.selDurationMin.val,
                    startTime: startTime,
                    endTime: endTime,
                    durationTime: durationTime
                }
            );
            $uibModalInstance.close("Sleep Saved");
        };*/

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
            console.log('hello');
            console.log($event);
            $event.preventDefault();
            $event.stopPropagation(); // This is the magic

            $scope[field] = !$scope[field];
        };

        $scope.ok = function(){
            console.log('it is ok');


            $uibModalInstance.close("Event Saved");
        }

        $scope.validateSleep = function(){
            var ok = true;

            return ok;
        }
    }
]);
