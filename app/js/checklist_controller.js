/**
 * Created by trieutran on 7/1/16.
 */
atoAlertnessControllers.controller('ChecklistController', ['$scope', '$rootScope', '$location', 'AuthenticationService', 'ChecklistService',
    function($scope, $rootScope, $location, AuthenticationService, ChecklistService) {
        $scope.asGuest = $rootScope.asGuest;
        $scope.emptyChecklist = true;
        $scope.checklistOpts = [
            {text: 'I am Following this Step', value: 0},
            {text: 'Need Improvement', value: 1},
        ];

        /*var questions = ['bedroom_temperature', 'bedroom_darkness', 'bedroom_quietness', 'bed_comfort', 'pets_in_bedroom',
         'regulate_bedtimes', 'relax_nighttime_routine', 'fall_back_to_sleep', 'coordinate_family_members', 'electronic_devices',
         'exercises_and_caffeine', 'alcohol_nicotine_meals'];*/

        var questions = ['plan_sleeptime', 'room_temperature', 'bedroom_darkness', 'room_quiet', 'bedroom_only',
            'regulate_waketimes', 'stop_caffeine', 'exercise_routine', 'no_alcohol', 'get_out_bed'];

        ChecklistService.getChecklist($scope.username, function(response){
            if(response.result == "success") {
                var data = response.data;
                var countAction = 0;
                if(angular.isObject(data) && !angular.equals({}, data)) {
                    for(var i = 0; i < questions.length; i++) {
                        $scope[questions[i]] = data[questions[i]];
                        var text_name = questions[i] + '_text';

                        if(data[text_name]) {
                            countAction ++;
                        }

                        $scope[text_name] = data[text_name];
                    }

                    if(countAction > 0) {   //only show the link to ToDos when there is more than 1 action text
                        $scope.emptyChecklist = false;
                    }
                }
                else {
                    for(var i = 0; i < questions.length; i++) {
                        $scope[questions[i]] = undefined;
                        var text_name = questions[i] + '_text';
                        $scope[text_name] = undefined;
                    }
                }
            }
            else {
                for(var i = 0; i < questions.length; i++) {
                    $scope[questions[i]] = undefined;
                    var text_name = questions[i] + '_text';
                    $scope[text_name] = undefined;
                }
            }
        });

        $scope.prepareData = function(){
            var postData = {};
            var isValid = true;
            var count = 0;

            for(var i = 0; i < questions.length; i++) {
                var $text_field = questions[i] + '_text';

                if($scope[questions[i]] == null){
                    isValid = false;
                }
                else {
                    count ++;
                    var choice = parseInt($scope[questions[i]]);
                    //console.log(choice);
                    postData[questions[i]] = choice;

                    if(choice == 1) {
                        postData[$text_field] = $scope[$text_field];
                    }
                    else {
                        postData[$text_field] = "";
                    }
                }
            }

            if(isValid) {
                return {
                    ok: true,
                    postData: postData,
                    message: ''
                };
            }
            else {
                return {
                    ok: false,
                    postData: null,
                    message: 'You completed ' + count + ' of ' + questions.length + ' checklist items.  Please go back and select all 10 items.',
                };
            }

        };

        $scope.setChecklist = function(){
            var $data = $scope.prepareData();
            //console.log($data);

            if($data.ok == false) {
                $scope.error = $data.message;
            }
            else {
                //console.log('not empty');
                ChecklistService.setChecklist($data.postData,
                    function(response){
                        if(response.success == "true") {
                            //$scope.message = response.message;
                            //$scope.message = "Checklist Data Saved";
                            $scope.emptyChecklist = false;  //display the link to "To-Dos" list
                            $location.path('/todos');
                        }
                        else {
                            $scope.error = response.message;
                        }
                    }
                );
            }
        };
    }
]);
