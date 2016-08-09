/**
 * Created by trieutran on 7/1/16.
 */
atoAlertnessControllers.controller('MeqController', ['$document', '$window', '$scope', '$location', 'MeqService',
    function($document, $window, $scope, $location, MeqService) {
        $scope.data = {};
        $scope.message = "";
        $scope.showForm = true;
        $scope.score = 0;
        $scope.type = '';

        for(var i = 1; i < 20; i++) {
            $scope["meq_" + i] = null;
        }

        MeqService.getData(function(response){
            console.log(response);
            if(response.success == "true") {
                angular.forEach(response.data, function(v, k){
                    $scope.data[k] = parseInt(v);
                });
            }
        });

        $scope.sumMeq = function(){
            var ttl = 0;

            angular.forEach($scope.data, function(v, k){
                ttl += parseInt(v);
            });

            return ttl;
        };

        $scope.getType = function(score){
            var type = '';

            if(score >= 16 && score <= 30){
                type = 'Definitely Evening Type';
            }
            else if(score >= 31 && score <= 41){
                type = 'Moderately Evening Type';
            }
            else if(score >= 42 && score <= 58){
                type = 'Neither Type';
            }
            else if(score >= 59 && score <= 69){
                type = 'Moderately Morning Type';
            }
            else if(score >= 70 && score <= 86){
                type = 'Definitely Morning Type';
            }

            return type;
        };

        $scope.meqSubmit = function(){
            var isValid = true;
            //validation
            for(var i = 1; i < 20; i++) {
                if($scope.data["meq_" + i] == null) {
                    isValid = false;
                    $scope.message = "You did not answer one or more MEQ questions.  Please go back and answer ALL 19 questions before scoring your MEQ";
                    break;
                }
            }

            if(isValid) {
                //do setting
                $scope.message = "";
                $scope.showForm = false;
                MeqService.setData($scope.data, function(response){
                    if(response.success) {
                        $scope.score = $scope.sumMeq();
                        $scope.type = $scope.getType($scope.score);
                    }
                });
            }

        };

        $scope.$watch('showForm', function(value){
            if(value == false) {
                $document[0].body.scrollTop = $document[0].documentElement.scrollTop = 0;
            }
        });
    }
]);