/**
 * Created by trieutran on 7/1/16.
 */
atoAlertnessControllers.controller('ChronotypeController', ['$rootScope', '$scope', '$location', 'ProfileDataService',
    function($rootScope, $scope, $location, ProfileDataService) {

        $scope.dataReady = false;

        $scope.chronoMessage = '';
        $scope.chronoError = '';

        $scope.chronoMorningSel = 0;
        $scope.chronoEveningSel = 0;
        $scope.chronoScore = null;
        $scope.chronoType = 'morning';

        $scope.chronoMorning = [
            {
                value: 4,
                text: 'Very High',
            },
            {
                value: 3,
                text: 'High',
            },
            {
                value: 2,
                text: 'Moderate',
            },
            {
                value: 1,
                text: 'Low',
            },
            {
                value: 0,
                text: 'Very Low',
            }
        ];

        $scope.chronoEvening = [
            {
                value: 4,
                text: 'Very High',
            },
            {
                value: 3,
                text: 'High',
            },
            {
                value: 2,
                text: 'Moderate',
            },
            {
                value: 1,
                text: 'Low',
            },
            {
                value: 0,
                text: 'Very Low',
            }
        ];

        $scope.$watch('chronoMorningSel', function(newVal, oldVal){
            $scope.calculateChrono();
        });

        $scope.$watch('chronoEveningSel', function(newVal, oldVal){
            $scope.calculateChrono();
        });

        $scope.calculateChrono = function(){
            $scope.chronoScore = $scope.chronoEveningSel - $scope.chronoMorningSel;

            if($scope.chronoScore <= -2){
                $scope.chronoType = 'Morning-Type';
            }
            else if($scope.chronoScore >= -1 && $scope.chronoScore <= 1) {
                $scope.chronoType = 'Mid-Range';
            }
            else {
                $scope.chronoType = 'Evening-Type';
            }

            if($scope.chronoMorningSel && $scope.chronoEveningSel) {
                $scope.dataReady = true;
            }
        };

        $scope.setChrono = function(){
            ProfileDataService.setProfile($scope.username, $scope.chronoMorningSel, $scope.chronoEveningSel,
                function(response){
                    if(response.success) {
                        //$scope.chronoMessage = response.message;
                        $location.path("/cirens-results");
                    }
                    else {
                        $scope.chronoError = response.message;
                    }
                });
        };

        ProfileDataService.getProfile($scope.username,
            function(response){
                if(angular.isDefined(response.data.chronoMorning)) {
                    $scope.chronoMorningSel = response.data.chronoMorning;
                }

                if(angular.isDefined(response.data.chronoEvening)) {
                    $scope.chronoEveningSel = response.data.chronoEvening;
                }

                for(var $i = 0; $i < $scope.chronoMorning.length; $i++) {
                    if(response.data.chronoMorning == $scope.chronoMorning[$i].value) {
                        $scope.chronoMorning[$i].isChecked = 1;
                    }
                    else {
                        $scope.chronoMorning[$i].isChecked = 0;
                    }
                }

                for(var $j= 0; $j < $scope.chronoEvening.length; $j++) {
                    if(response.data.chronoEvening == $scope.chronoEvening[$j].value) {
                        $scope.chronoEvening[$j].isChecked = 1;
                    }
                    else {
                        $scope.chronoEvening[$j].isChecked = 0;
                    }
                }
                $scope.calculateChrono();
            }
        );
    }
]);