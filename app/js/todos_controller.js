/**
 * Created by trieutran on 7/1/16.
 */
atoAlertnessControllers.controller('ToDosController', ['$scope', 'AuthenticationService', 'ChecklistService',
    function($scope, AuthenticationService, ChecklistService) {

        /*$scope.questions = ['bedroom_temperature', 'bedroom_darkness', 'bedroom_quietness', 'bed_comfort', 'pets_in_bedroom',
         'regulate_bedtimes', 'relax_nighttime_routine', 'fall_back_to_sleep', 'coordinate_family_members', 'electronic_devices',
         'exercises_and_caffeine', 'alcohol_nicotine_meals'];*/

        $scope.questions = ['plan_sleeptime', 'room_temperature', 'bedroom_darkness', 'room_quiet', 'bedroom_only',
            'regulate_waketimes', 'stop_caffeine', 'exercise_routine', 'no_alcohol', 'get_out_bed'];

        //initiate xxx_check variables
        for(var i = 0; i < $scope.questions.length; i++) {
            var check_name = $scope.questions[i] + '_check';
            $scope[check_name] = 0;
        }

        ChecklistService.getChecklist($scope.username, function(response){
            if(response.result == "success") {
                var data = response.data;
                console.log(data);
                if(angular.isObject(data) && !angular.equals({}, data)) {
                    for(var i = 0; i < $scope.questions.length; i++) {
                        $scope[$scope.questions[i]] = data[$scope.questions[i]];
                        var text_name = $scope.questions[i] + '_text';


                        if(data[$scope.questions[i]] == 1) {
                            if(angular.isUndefined(data[text_name])) {
                                $scope[text_name] = 'Need Improvement';
                            }
                            else {
                                $scope[text_name] = data[text_name];
                            }
                        }
                    }
                }
                else {
                    for(var i = 0; i < $scope.questions.length; i++) {
                        $scope[$scope.questions[i]] = undefined;
                        var text_name = $scope.questions[i] + '_text';
                        $scope[text_name] = undefined;
                    }
                }
            }
            else {
                for(var i = 0; i < $scope.questions.length; i++) {
                    $scope[$scope.questions[i]] = undefined;
                    var text_name = $scope.questions[i] + '_text';
                    $scope[text_name] = undefined;
                }
            }
        });

        $scope.setToDosList = function(){
            var postData = {};
            for(var i = 0; i < $scope.questions.length; i++) {
                var checkName = $scope.questions[i] + '_check';
                var textName = $scope.questions[i] + '_text';

                if($scope[checkName] == 1) {
                    $scope[$scope.questions[i]] = 0;
                    $scope[textName] = '';
                }
                postData[$scope.questions[i]] = $scope[$scope.questions[i]];
                postData[textName] = $scope[textName];
            }

            ChecklistService.setChecklist(postData,
                function(response){
                    if(response.success == "true") {
                        $scope.message = "Checklist Data Saved";
                    }
                    else {
                        $scope.error = response.message;
                    }
                }
            );

        }
    }
]);