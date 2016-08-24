/**
 * Created by trieutran on 8/23/16.
 */
/**
 * Created by trieutran on 7/1/16.
 */
atoAlertnessControllers.controller('MyChargeCalendarModalController', ['$scope', '$uibModalInstance', 'calEvent', 'modalTitle', 'CaffeineService',
    function($scope, $uibModalInstance, calEvent, modalTitle, CaffeineService) {

        $scope.startOpen = false;
        $scope.endOpen = false;
        $scope.modalTitle = modalTitle;
        $scope.calEvent = calEvent;

        $scope.caffeineItems = CaffeineService.getData();
        $scope.quantity = [];

        for(var i = 1; i <= 10; i++) {
            $scope.quantity.push(i);
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
            $uibModalInstance.dismiss('cancel');
        };

        $scope.toggle = function($event, field, evt){
            console.log(evt);
            console.log(field);

            $event.preventDefault();
            $event.stopPropagation();

            //event[field] = !event[field];
            $scope[field] = !$scope[field];
        };
    }
]);
