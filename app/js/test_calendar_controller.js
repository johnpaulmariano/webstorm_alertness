/**
 * Created by trieutran on 7/1/16.
 */
atoAlertnessControllers.controller('TestCalendarController', ['$window', '$rootScope', '$scope', '$location', 'MyChargeDataService',
    function($window, $rootScope, $scope, $location, MyChargeDataService) {
        //expecting data format
        $scope.scenario = 1;
        $scope.data = [];
        //var asGuest = $rootScope.asGuest;

        $scope.setData = function setData(scenario) {
            switch(scenario) {
                case 1:
                    var data = [{
                        "tsStart": 1473336000001,
                        "dataType": "caffeine",
                        "sourceID": 10,
                        "amount": 110,
                        "quantity": 2,
                        "source": "LIPTON TEA REGULAR BLACK TEA (8 oz.)"
                    }, {
                        "tsStart": 1473246000001,
                        "dataType": "caffeine",
                        "sourceID": 1,
                        "amount": 410,
                        "quantity": 1,
                        "source": "STARBUCKS COFFEE VENTI (20 oz.)"
                    },
                        {
                            "tsEnd": 1473674400001,
                            "tsStart": 1473649200001,
                            "dataType": "sleep"
                        }, {
                            "tsEnd": 1473567300001,
                            "tsStart": 1473559200001,
                            "dataType": "sleep"
                        }];

                    break;
            }

            var result = {
                success: true,
                data: data,
            };
            console.log('test calendar controller');
            MyChargeDataService.setData(result.data, function (response) {
                console.log(response);
                if (response.success == true) {
                    //$location.path("/gauge2");
                    $scope.data = response.data;

                }
                else {
                    $scope.message = response.message;
                }
            });
        }

        $scope.setData($scope.scenario);

    }
]);