/**
 * Created by trieutran on 7/1/16.
 */
atoAlertnessControllers.controller('MyChargeModalController', ['$scope', '$uibModalInstance', 'dropdowns', 'sleeps', 'dayDropdowns','errorDays',
    function($scope, $uibModalInstance, dropdowns, sleeps, dayDropdowns, errorDays) {
        $scope.dropdowns = dropdowns;
        $scope.sleeps = sleeps;
        $scope.errorDays = errorDays;
        $scope.dayDropdowns = dayDropdowns;
        $scope.currentDay = {
            txt: 1,
            val: 0
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
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
]);