/**
 * Created by trieutran on 7/1/16.
 * @file
 * a controller for a caffeine drink modal which pops up when user add a caffeine drink event
 * Note: It is deprecated, and has been replaced by my_charge_calendar_modal_controller
 */
atoAlertnessControllers.controller('CaffeineModalController', ['$scope', '$uibModalInstance', 'caffeine', 'dropdowns', 'dayDropdowns',
    function($scope, $uibModalInstance, caffeine, dropdowns, dayDropdowns) {
        $scope.dropdowns = dropdowns;
        $scope.caffeine = caffeine;
        $scope.dayDropdowns = dayDropdowns;
        $scope.currentDay = {
            txt: 1,
            val: 0
        };
        $scope.formDisabled = true;

        $scope.c = {
            //day: null,
            caffeineSource: null,
            quantity: null,
            hour: null,
            minute: null
        };

        $scope.$watch('c', function() {
            var ok = true;
            angular.forEach($scope.c, function(v, k) {
                if(!v) {
                    ok = ok && false;
                }
                else {
                    ok = ok && true;
                }
            });

            if(ok) {
                $scope.formDisabled = false;
            }
        }, true);

        $scope.ok = function () {
            var caffeineData = {
                hour: $scope.c.hour.val,
                minute: $scope.c.minute.val,
                source: $scope.c.caffeineSource.name,
                amount: $scope.c.caffeineSource.value,
                quantity: $scope.c.quantity
            };

            if($scope.caffeine[$scope.currentDay.val] == undefined) {
                $scope.caffeine[$scope.currentDay.val] = [];
            }

            $scope.caffeine[$scope.currentDay.val].push(caffeineData);

            $uibModalInstance.close("Caffeine Drink Saved");
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
]);
