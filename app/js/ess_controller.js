/**
 * Created by trieutran on 7/1/16.
 */
atoAlertnessControllers.controller('EssController', ['$document', '$window', '$scope', '$location', 'EssService',
    function($document, $window, $scope, $location, EssService) {
        $scope.data = {};
        $scope.message = "";
        $scope.showForm = true;
        $scope.score = 0;
        $scope.type = '';

        for(var i = 1; i < 9; i++) {
            $scope["ess_" + i] = null;
        }

        EssService.getData(function(response){
            console.log(response);
            if(response.success == "true") {
                angular.forEach(response.data, function(v, k){
                    $scope.data[k] = parseInt(v);
                });
            }
        });



        $scope.sumEss = function(){
            var ttl = 0;

            angular.forEach($scope.data, function(v, k){
                ttl += parseInt(v);
            });

            return ttl;
        };


        $scope.essSubmit = function(){
            var isValid = true;
            //validation
            for(var i = 1; i < 8; i++) {
                console.log($scope.data["ess_" + i]);
                if($scope.data["ess_" + i] == null) {
                    isValid = false;
                    $scope.message = "You did not answer one or more ESS questions.  Please go back and answer ALL 8 questions before scoring your ESS";
                    break;
                }
            }

            if(isValid) {
                //do setting
                $scope.message = "";
                $scope.showForm = false;
                EssService.setData($scope.data, function(response){
                    if(response.success) {
                        $scope.score = $scope.sumEss();
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