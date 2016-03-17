'use strict';
/* Controllers */

var atoAlertnessControllers = angular.module('atoAlertnessControllers', []);

atoAlertnessControllers.controller('ApplicationController', ['$scope', '$rootScope', '$location', 'AuthenticationService', 'RememberMeService',  
    function($scope, $rootScope, $location, AuthenticationService, RememberMeService){
        $rootScope.appError = '';
        $rootScope.appMessage = '';
        /*RememberMeService.authenticateMe(function(res){
            console.log('remember me service called');
            console.log(res);
            if(res.success == "true") {
                AuthenticationService.SetCredentials(res.username, res.token);
                $scope.isAuthenticated = true;
            }
            
            if($scope.isAuthenticated == true) {
                if($location.path() == "/" || $location.path() == "/login")
                    $location.path('/profile');
            }
        });*/
    }
]);

atoAlertnessControllers.controller('LoginController',
    ['$scope', '$rootScope', '$location', 'AuthenticationService', 'RememberMeService', 'TokenService', '$cookieStore', '$http',
    function ($scope, $rootScope, $location, AuthenticationService, RememberMeService, TokenService, $cookieStore, $http) {
        
        AuthenticationService.ClearCredentials(); // reset login status
        
        $scope.rememberMe = 0;
        $scope.dataLoading = false;
       
        $scope.isAuthenticated = false;
        $scope.username = '';
        $scope.password = '';
        $scope.password2 = '';
        $scope.email = '';
        
        $scope.isShowLogin = false;
        $scope.isShowRegister = false;
        
        $scope.loginMessage = '';
        $scope.loginError = '';
        $scope.registerMessage = '';
        $scope.registerError = '';
        
        $scope.$watch('username', function(newValue, oldValue){
            //console.log('change');
            $scope.username = angular.lowercase($scope.username);
        });
        
        $scope.login = function () {
            $scope.dataLoading = true;
            $rootScope.asGuest = false;
            $cookieStore.remove("asGuestCookies");
            AuthenticationService.Login($scope.username, $scope.password, $scope.rememberMe, function (response) {
                //console.log('controller login');
                if(response.success == "true") {
                    AuthenticationService.SetCredentials(response.username, response.token);
                    $scope.isAuthenticated = true;
                    
                    if($scope.rememberMe == 1) {
                        //workaround because $cookieStore expects a json object when using get method
                        var cookieStr = angular.toJson({username: response.username, token: response.token});
                        RememberMeService.rememberMe(cookieStr);
                    }
                    else {
                        RememberMeService.forgetMe();
                    }
                    $location.path('/home');
                } else {
                    $scope.loginError = response.message;
                    $scope.dataLoading = false;
                }
            });
        };
        
        $scope.showLogin = function(){
            $scope.isShowLogin = true;
            $scope.isShowRegister = false;
        };
        
        $scope.showRegister = function(){
            $scope.isShowLogin = false;
            $scope.isShowRegister = true;
        };
        
        $scope.register = function () {
            
            if($scope.password != $scope.password2) {
                $scope.error = 'Password not matching';
            }
            else {
                $scope.dataLoading = true;
                /* waiting for CSSI to enable capturing email */
                //AuthenticationService.Register($scope.username, $scope.password, $scope.email,
                AuthenticationService.Register($scope.username, $scope.password, 
                    function (response) {
                        if(response.success == "true") {
                            // try to re-route newly created user to profile page after registration
                            //but it doesn't work
                            /*AuthenticationService.SetCredentials(response.username, response.token);
                            $scope.isAuthenticated = true;
                            $http.defaults.headers.common.Authorization = 'Basic ' + response.token;
                            TokenService.getToken(function(res){
                                if(res.success == "true") {
                                    $cookieStore.put('X-CSRF-TOKEN', res.token);
                                    $http.defaults.headers.common['X-CSRF-TOKEN'] = $cookieStore.get('X-CSRF-TOKEN');
                                    //console.log('get a new csrf token for new user ' + response.token);
                                }
                            });
                            $location.path('/profile');*/
                            
                            //solution: keep user in login page
                            $scope.loginMessage = "Your account created.  Please login";
                            TokenService.getToken(function(res){
                                if(res.success == "true") {
                                    $cookieStore.put('X-CSRF-TOKEN', res.token);
                                    $http.defaults.headers.common['X-CSRF-TOKEN'] = $cookieStore.get('X-CSRF-TOKEN');
                                    //console.log('get a new csrf token for new user ' + response.token);
                                }
                            });
                            $scope.showLogin();
                            $scope.dataLoading = false;
                            $scope.userName = '';
                            $scope.password = '';
                            //$location.path('/login');
                            
                        } else {
                            $scope.registerError = response.message;
                            $scope.dataLoading = false;
                        }
                    });
            }
        };
        
        $scope.loginAsGuest = function()
        {
            $rootScope.asGuest = true;
            $cookieStore.put('asGuestCookies', true);
            $location.path('/home');
        }
    }
]);

atoAlertnessControllers.controller('LogoutController', ['$scope', '$rootScope', '$location', '$http', '$cookieStore', 'AuthenticationService', 'RememberMeService', 'TokenService',
    function ($scope, $rootScope, $location, $http, $cookieStore, AuthenticationService, RememberMeService, TokenService) {
        // reset login status
        $scope.logout = function () {
            RememberMeService.forgetMe();
            AuthenticationService.ClearCredentials();
            $cookieStore.remove('X-CSRF-TOKEN');
            $rootScope.logout = true;
            $rootScope.asGuest = false;
            //console.log('logout');
           
            $location.path('/login');
        };
    }
]);

atoAlertnessControllers.controller('ProfileController', ['$rootScope', '$scope', '$location', 'AuthenticationService', 'ChangePasswordService', 'ProfileDataService', 'RememberMeService',
    function($rootScope, $scope, $location, AuthenticationService, ChangePasswordService, ProfileDataService, RememberMeService) {
        
        //guest has no access to profile page, therefore guest will be redirected to home page
        if($rootScope.asGuest === true) {
            $location.path('/home');
        }
        
        var $user = AuthenticationService.getUser();
        $scope.dataReady = false;
        $scope.username = $user.username;
        $scope.password1 = '';
        $scope.password2 = '';
        $scope.passwordMatched = true;
        
        $scope.showPasswordForm = false;
        $scope.showChronotypeForm = true;
        $scope.passwordMessage = '';
        $scope.passwordError = '';
        
        $scope.email = '';
        $scope.emailMessage = '';
        $scope.emailError = '';
                
        $scope.changePassword = function(){
            if($scope.password1 != $scope.password2) {
                //$scope.passwordMatched = false;
                $scope.error = 'Password not matching';
            }
            else {
                ChangePasswordService.changePassword($scope.username, $scope.password1, 
                    function (response) {
                        if (response.success == "true") {
                            AuthenticationService.ClearCredentials();
                            AuthenticationService.SetCredentials($scope.username, response.token);
                            RememberMeService.forgetMe();
                            $scope.passwordMessage = "Password reset.  Please logout and re-login again.";
                            $location.path('/profile');
                        } else {
                            //if(response.status == 401) {    //redirect to login page
                            //    $rootScope.appError = response.message;
                            //    $location.path('/login');
                            //}
                            //else {
                                $scope.passwordError = response.message;
                            //}
                        }
                    });
                }
        };
        
        $scope.updateEmail = function() {
            ProfileDataService.setEmail($scope.username, $scope.email, function(response){
                if(response.success) {
                    $scope.emailMessage = response.message;
                }
                else {
                    $scope.emailError = response.message;
                }
            });
        }
        
        ProfileDataService.getProfile($scope.username, 
            function(response){
                
                if(angular.isDefined(response.data.email)) {
                    $scope.email = response.data.email;
                }
            }
        );

        /*
         * $scope.setChrono = function(){
            ProfileDataService.setProfile($scope.username, $scope.chronoMorningSel, $scope.chronoEveningSel, 
                function(response){
                    if(response.success) {
                        $scope.chronoMessage = response.message;
                    }
                    else {
                        $scope.chronoError = response.message;
                    }
                });
        };
         */ 
    }
]);

atoAlertnessControllers.controller('SleepNeedController', ['$scope', '$location', '$rootScope', 'AuthenticationService', 'SleepNeedService', 
    function($scope, $location, $rootScope, AuthenticationService, SleepNeedService){
        //var user = AuthenticationService.getUser();
        
        //$scope.username = user.username;
        $scope.day4hours = ['-', 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
        $scope.day5hours = ['-', 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
        $scope.day6hours = ['-',0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
        $scope.day4minutes = [0, 15, 30, 45];
        $scope.day5minutes = [0, 15, 30, 45];
        $scope.day6minutes = [0, 15, 30, 45];
        
        $scope.day4selectedhours = 0;
        $scope.day5selectedhours = 0;
        $scope.day6selectedhours = 0;
        $scope.day4selectedminutes = 0;
        $scope.day5selectedminutes = 0;
        $scope.day6selectedminutes = 0;
        $scope.sleepNeed = 0;
        $scope.error = '';
        $scope.saveBtnDisabled = true;
        $scope.day4minDis = true;
        $scope.day5minDis = true;
        $scope.day6minDis = true;
        
        $scope.calculateSleepNeed = function(){
            var countDays = 0;
            var totalDay4 = 0;
            var totalDay5 = 0;
            var totalDay6 = 0;
            
            if(angular.isNumber($scope.day4selectedhours)) {
                $scope.day4minDis = false;
                totalDay4 = $scope.day4selectedhours + $scope.day4selectedminutes/60;
                if(totalDay4 > 0) {
                    countDays ++;
                }
            }
            else {
                $scope.day4selectedminutes = 0;
                $scope.day4minDis = true;
            }
            
            if(angular.isNumber($scope.day5selectedhours)) {
                $scope.day5minDis = false;
                totalDay5 = $scope.day5selectedhours + $scope.day5selectedminutes/60;
                if(totalDay5 > 0) {
                    countDays ++;
                }
            }
            else {
                $scope.day5selectedminutes = 0;
                $scope.day5minDis = true;
            }
            
            if(angular.isNumber($scope.day6selectedhours)) {
                $scope.day6minDis = false;
                totalDay6 = $scope.day6selectedhours + $scope.day6selectedminutes/60;
                if(totalDay6 > 0) {
                    countDays ++;
                }
            }
            else {
                $scope.day6selectedminutes = 0;
                $scope.day6minDis = true;
            }
            
            var sleepNeed = 0;
            
            if(countDays > 0) {
                sleepNeed = (totalDay4 + totalDay5 + totalDay6)/countDays;
            }
            
            $scope.sleepNeed = sleepNeed.toFixed(2);
            if($scope.sleepNeed > 0) {
                $scope.saveBtnDisabled = false;
            }
            else {
                $scope.saveBtnDisabled = true;
            }
        };
        
        $scope.convertTime2Block = function(inTime) {
            var outTime = {
                'hours': undefined,
                'minutes': undefined
            };
            
            if(inTime)
            {
                var hours = Math.floor(inTime);
                var minutes = (inTime - hours) * 60/ 15;
                minutes = Math.ceil(minutes);
                outTime.hours = hours;
                outTime.minutes = minutes * 15;
            }
            
            return outTime;
        }
        
        $scope.convertBlock2Time = function() {
            var outTime = {};
            
            if(angular.isNumber($scope.day4selectedhours)) {
                outTime.day4 = $scope.day4selectedhours + $scope.day4selectedminutes/60;
            }
            
            if(angular.isNumber($scope.day5selectedhours)) {
                outTime.day5 = $scope.day5selectedhours + $scope.day5selectedminutes/60;
            }
            
            if(angular.isNumber($scope.day6selectedhours)) {
                outTime.day6 = $scope.day6selectedhours + $scope.day6selectedminutes/60;
            }
            
            angular.forEach(outTime, function(v, k){
                if(v == 0)
                    outTime[k] = null;
            });
            
            return outTime;
        }
        
        SleepNeedService.getSleepNeed(function(response){
            if(response.result == "success") {
                if(angular.isDefined(response.data.day4)) {
                    var tempTime = $scope.convertTime2Block(response.data.day4);
                    $scope.day4selectedhours = tempTime.hours;
                    $scope.day4selectedminutes = tempTime.minutes;
                }
                if(angular.isDefined(response.data.day5)) {
                    var tempTime = $scope.convertTime2Block(response.data.day5);
                    $scope.day5selectedhours = tempTime.hours;
                    $scope.day5selectedminutes = tempTime.minutes;
                }
                if(angular.isDefined(response.data.day6)) {
                    var tempTime = $scope.convertTime2Block(response.data.day6);
                    $scope.day6selectedhours = tempTime.hours;
                    $scope.day6selectedminutes = tempTime.minutes;
                }
                $scope.calculateSleepNeed();
            }
        });
        
        $scope.saveSleepNeed = function() {
            //console.log('save sleep neeed');
            $rootScope.sleepNeed = $scope.sleepNeed;
            var calcVal = $scope.convertBlock2Time();
            
            SleepNeedService.setSleepNeed(calcVal, 
                function(response){
                    if(response.result == "success") {
                        $rootScope.sleepNeed = response.sleepNeed;
                        $location.path('/sleepdebt');
                    }
                    else {
                        $scope.error = response.message;
                    }
                }
            );
           
        };
    }
]);

atoAlertnessControllers.controller('SleepDebtController', ['$scope', '$rootScope', 'AuthenticationService', 'SleepDebtService', 
    function($scope, $rootScope, AuthenticationService, SleepDebtService) {
        //var user = AuthenticationService.getUser();
        $scope.numOfDays = 7;
        $scope.asGuest = $rootScope.asGuest;
        
        for(var i = 1; i <= $scope.numOfDays; i++) {
            var namePrefix = 'day' + i;
            $scope[namePrefix + 'hours'] = ['-', 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
            $scope[namePrefix + 'minutes'] = [0, 15, 30, 45];
            $scope[namePrefix + 'selectedhours'] = 0;
            $scope[namePrefix + 'selectedminutes'] = 0;
            $scope[namePrefix + 'minDis'] = true;
        }
        
        //$scope.username = user.username;
        $scope.sleepNeed = 8;
        $scope.dataReady = false;
        $scope.sleepDebt = 0;
        $scope.message = '';
        $scope.error = '';
        $scope.zeroEntry = true;
        
        $scope.saveBtnDisabled = true;
        
        $scope.prepareData = function() {
            var outTime = {};
            for(var i = 1; i <= $scope.numOfDays; i++) {
                var selectDay = 'day' + i;
                var selectHoursVar = selectDay + 'selectedhours';
                var selectMinsVar = selectDay + 'selectedminutes';
                 
                if(angular.isNumber($scope[selectHoursVar])) {
                    outTime[selectDay] = $scope[selectHoursVar] + $scope[selectMinsVar]/60;
                }
            }
            
            angular.forEach(outTime, function(v, k){
                if(v == 0)
                    outTime[k] = null;
            });
            
            return outTime;
        };
        
        $scope.saveSleepDebt = function() {
            var calcTime = $scope.prepareData();
            SleepDebtService.setSleepDebt(calcTime,  
                function(response){
                    if(response.success) {
                        $scope.message = response.message;
                    }
                    else {
                        $scope.error = response.message;
                    }
                }
            );
        };
        
        $scope.calculateSleepDebt = function() {
            var sleepDebt = 0;
            
            for(var i = 1; i <= $scope.numOfDays; i++) {
                var selectDay = 'day' + i;
                var selectHoursVar = selectDay + 'selectedhours';
                var selectMinsVar = selectDay + 'selectedminutes';
                var dayMinDis = selectDay + 'minDis';
            
                if(angular.isNumber($scope[selectHoursVar])) {
                    $scope[dayMinDis] = false;
                    var ttlTime = $scope[selectHoursVar] + $scope[selectMinsVar]/60;
                    
                    if(ttlTime > 0) {
                        sleepDebt += - $scope.sleepNeed + ttlTime;
                        $scope.zeroEntry = false;
                    }
                }
            }
            
            $scope.sleepDebt = sleepDebt.toFixed(2);
        };
        
        SleepDebtService.getSleepNeed(function(response){
            if(response.result == "success") {
                var sleepNeed = 0;
                var dayCount = 0;
                angular.forEach(response.data, function(v, k){
                    if(v != undefined && v != null) {
                        dayCount ++;
                        sleepNeed += v;
                    }
                });
                
                if(dayCount > 0) {
                    sleepNeed = sleepNeed/dayCount; 
                    $scope.sleepNeed = sleepNeed.toFixed(2);
                }
                
            }
            
            $scope.calculateSleepDebt();
        });
        
        $scope.convertTime2Block = function(inTime) {
            var outTime = {
                'hours': undefined,
                'minutes': undefined
            };
            
            if(inTime)
            {
                var hours = Math.floor(inTime);
                var minutes = (inTime - hours) * 60/ 15;
                minutes = Math.ceil(minutes);
                outTime.hours = hours;
                outTime.minutes = minutes * 15;
            }
            
            return outTime;
        }
        
        SleepDebtService.getSleepDebt(function(response){
            $scope.dataReady = true;
            if(response.success) {
                var data = response.data;
                
                for(var i = 1; i <= $scope.numOfDays; i++) {
                    var selectDay = 'day' + i;
                    var selectHoursVar = selectDay + 'selectedhours';
                    var selectMinsVar = selectDay + 'selectedminutes';
                    
                    if(angular.isDefined(data[selectDay])) {
                        var tempTime = $scope.convertTime2Block(data[selectDay]);
                        $scope[selectHoursVar] = tempTime.hours;
                        $scope[selectMinsVar] = tempTime.minutes;
                    }
                }
            }
            $scope.calculateSleepDebt();
        });
    }
]);

atoAlertnessControllers.controller('ChecklistController', ['$scope', '$rootScope', 'AuthenticationService', 'ChecklistService', 
    function($scope, $rootScope, AuthenticationService, ChecklistService) {
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
                console.log(data);
                var countAction = 0;
                //console.log(data);
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
            var $postData = {};
            for(var i = 0; i < questions.length; i++) {
                var $text_field = questions[i] + '_text';
                $postData[questions[i]] = parseInt($scope[questions[i]]);
                
                if($postData[questions[i]] == 0) {
                    $postData[$text_field] = "";
                }
                else {
                    $postData[$text_field] = $scope[$text_field];
                }
            }
            
            //console.log($postData);
            
            return $postData;
        };
        
        $scope.setChecklist = function(){
            var $data = $scope.prepareData();
            console.log($data);
            ChecklistService.setChecklist($data, 
                function(response){
                    if(response.success == "true") {
                        //$scope.message = response.message;
                        $scope.message = "Checklist Data Saved";
                        $scope.emptyChecklist = false;  //display the link to "To-Dos" list
                    }
                    else {
                        $scope.error = response.message;
                    }
                }
            );
        };
    }
]);

atoAlertnessControllers.controller('NavBarController', ['$scope', '$rootScope', 
    function($scope, $rootScope) {
        if($rootScope.asGuest == true) {
            $scope.asGuest = true;
        }
        else {
            $scope.asGuest = false;
        }
    }
]);

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
                //console.log(data);
                if(angular.isObject(data) && !angular.equals({}, data)) {
                    for(var i = 0; i < $scope.questions.length; i++) {
                        $scope[$scope.questions[i]] = data[$scope.questions[i]];
                        var text_name = $scope.questions[i] + '_text';
                        $scope[text_name] = data[text_name];
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
                
                //console.log($scope);
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
                    //console.log(response);
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

atoAlertnessControllers.controller('ChronotypeController', ['$rootScope', '$scope', '$location', 'ProfileDataService',
    function($rootScope, $scope, $location, ProfileDataService) {
        
        $scope.dataReady = false;
        
        $scope.chronoMessage = '';
        $scope.chronoError = '';
        
        $scope.chronoMorningSel = 0;
        $scope.chronoEveningSel = 0;
        $scope.chronoScore = 0;
        $scope.chronoType = 'morning';
        
        $scope.chronoMorning = [
            {
                value: 5,
                text: 'Very High',
            }, 
            {
                value: 4,
                text: 'High',
            }, 
            {
                value: 3,
                text: 'Moderate',
            },
            {
                value: 2,
                text: 'Low',
            },
            {
                value: 1,
                text: 'Very Low',
            }
        ];

        $scope.chronoEvening = [
           {
                value: 5,
                text: 'Very High',
            }, 
            {
                value: 4,
                text: 'High',
            }, 
            {
                value: 3,
                text: 'Moderate',
            },
            {
                value: 2,
                text: 'Low',
            },
            {
                value: 1,
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
                        $scope.chronoMessage = response.message;
                    }
                    else {
                        $scope.chronoError = response.message;
                    }
                });
        };
        
        ProfileDataService.getProfile($scope.username, 
            function(response){
                //console.log(response);
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

atoAlertnessControllers.controller('ResetPasswordController', ['$rootScope', '$scope', '$location', 'ResetPasswordService',
    function($rootScope, $scope, $location, ResetPasswordService) {
        $scope.email = '';
        $scope.resetMessage = '';
        $scope.resetError = '';
       
        $scope.resetPassword = function(){
            ResetPasswordService.resetPassword($scope.email, 
                function(response){
                    if(response.success) {
                        $scope.resetMessage = response.message;
                    }
                    else {
                        $scope.resetError = response.message;
                    }
                });
        };
       
    }
]);

atoAlertnessControllers.controller('DashboardController', ['$rootScope', '$scope', '$location', 'ProfileDataService', 'SleepNeedService', 'SleepDebtService',
    function($rootScope, $scope, $location, ProfileDataService, SleepNeedService, SleepDebtService) {
        
        $scope.chronoType = '';
        $scope.chronoAbbrev = '';
        $scope.sleepNeed = 0;
        $scope.numOfDays = 7;
        $scope.sleepDebt = 0;
        $scope.sleepDebtSign = '';
        
        for(var i = 1; i <= $scope.numOfDays; i++) {
            var namePrefix = 'day' + i;
            $scope[namePrefix + 'selectedhours'] = 0;
            $scope[namePrefix + 'selectedminutes'] = 0;
            $scope[namePrefix + 'minDis'] = true;
        }
        
        ProfileDataService.getProfile($scope.username, 
            function(response){
                var chronoMorningSel = 0, chronoEveningSel = 0;
                if(angular.isDefined(response.data.chronoMorning)) {
                    chronoMorningSel = response.data.chronoMorning;
                }
                
                if(angular.isDefined(response.data.chronoEvening)) {
                    chronoEveningSel = response.data.chronoEvening;
                }
               
                var chronoScore = chronoEveningSel - chronoMorningSel;

                if(chronoScore <= -2){
                    $scope.chronoType = 'Morning-Type';
                    $scope.chronoAbbrev = 'morning';
                }
                else if(chronoScore >= -1 && chronoScore <= 1) {
                    $scope.chronoType = 'Mid-Range';
                    $scope.chronoAbbrev = 'mid';
                }
                else {
                    $scope.chronoType = 'Evening-Type';
                    $scope.chronoAbbrev = 'evening';
                }
            }
        );

        SleepDebtService.getSleepNeed(function(response){
            if(response.result == "success") {
                var sleepNeed = 0;
                var dayCount = 0;
                angular.forEach(response.data, function(v, k){
                    if(v != undefined && v != null) {
                        dayCount ++;
                        sleepNeed += v;
                    }
                });
                
                if(dayCount > 0) {
                    sleepNeed = sleepNeed/dayCount; 
                    $scope.sleepNeed = sleepNeed.toFixed(2);
                }
                
            }
            
            //$scope.calculateSleepDebt();
        });
        
        SleepDebtService.getSleepDebt(function(response){
            $scope.dataReady = true;
            if(response.success) {
                var data = response.data;
                
                for(var i = 1; i <= $scope.numOfDays; i++) {
                    var selectDay = 'day' + i;
                    if(response.data[selectDay]) {
                        var remaining = - $scope.sleepNeed + response.data[selectDay];
                        $scope.sleepDebt += remaining;
                    }
                }
                
                $scope.sleepDebt = $scope.sleepDebt.toFixed(2);
                
                if($scope.sleepDebt > 0) {
                    $scope.sleepDebtSign = '+';
                }
                else if($scope.sleepDebt < 0) {
                     $scope.sleepDebtSign = '-';
                }
            }
        });
    }
]);

atoAlertnessControllers.controller('GaugeController', ['$window', '$scope', '$location',
    function($window, $scope, $location) {
        $scope.hourRange = 24;
        $scope.tickInterval = 4;
        $scope.step = 1;
        $scope.defaultTick = $scope.hourRange * $scope.tickInterval;
        $scope.minRange = 0;
        $scope.maxRange = $scope.hourRange * $scope.tickInterval * 2;
        $scope.sliderVal = undefined;
        $scope.sliderValText = "0";

        if($scope.sliderVal == undefined) {
            $scope.sliderVal = $scope.defaultTick;
        }

        //slider config
        $scope.minSlider = {
            minValue: $scope.minRange,
            maxValue: $scope.maxRange,
            //step: $scope.step,
            value: $scope.defaultTick,
            options: {
                floor: $scope.minRange,
                ceil: $scope.maxRange,
                step: $scope.step,
                translate: function(value){
                    return $scope.getSlideVal(parseInt(value));
                },
                onEnd: function(){
                    console.log('end');
                    console.log($scope.minSlider.value);
                    $scope.sliderValText = $scope.minSlider.value;
                    $window.updateGauges();
                }

            }
        };

        $scope.getSlideVal = function(v){
            var remainder = Math.abs(v - $scope.defaultTick) % $scope.tickInterval;
            var minutes = remainder * 15;   // 15 minutes
            var hours = (Math.abs(parseInt(v) - $scope.defaultTick) - remainder) / $scope.tickInterval;

            var valString = hours + " hours and " + minutes + " minutes";
            if(v < $scope.hourRange * $scope.tickInterval) {
                valString = " - " + valString;
            }

            return valString;
        };
    }
]);

atoAlertnessControllers.controller('Gauge2Controller', ['$window', '$scope', '$location',
    function($window, $scope, $location) {
        //initiate vars for sliders
        $scope.hourRange = 24;
        $scope.tickInterval = 4;
        $scope.step = 1;
        $scope.defaultTick = $scope.hourRange * $scope.tickInterval;
        $scope.minRange = 0;
        $scope.maxRange = $scope.hourRange * $scope.tickInterval * 2;
        $scope.sliderVal = undefined;
        $scope.sliderValText = "0";

        if($scope.sliderVal == undefined) {
            $scope.sliderVal = $scope.defaultTick;
        }

        //initiate vars for gauge
        $scope.gauge = {};
        $scope.gauge.value = 50;
        $scope.gauge.upperLimit = 100;
        $scope.gauge.lowerLimit = 0;
        $scope.gauge.unit = "%";
        $scope.gauge.precision = 2;
        $scope.gauge.ranges = [
            {
                min: 0,
                max: 20,
                color: '#bc1705'
            },
            {
                min: 20,
                max: 40,
                color: '#ae4c0f'
            },
            {
                min: 40,
                max: 60,
                color: '#a07e1a'
            },
            {
                min: 60,
                max: 80,
                color: ' #95ab23'
            },
            {
                min: 80,
                max: 100,
                color: '#8ec929'
            }
        ];

        //slider config
        $scope.minSlider = {
            minValue: $scope.minRange,
            maxValue: $scope.maxRange,
            //step: $scope.step,
            value: $scope.defaultTick,
            options: {
                floor: $scope.minRange,
                ceil: $scope.maxRange,
                step: $scope.step,
                translate: function(value){
                    return $scope.getSlideVal(parseInt(value));
                },
                onEnd: function() {
                    // user finished sliding a handle
                    console.log('end');
                    console.log($scope.minSlider.value);
                    $scope.sliderValText = $scope.minSlider.value;

                    var hVal = Math.random() * 100;

                    console.log(hVal);

                    $scope.gauge.value = hVal;
                }

            }
        };

        $scope.getSlideVal = function(v){
            var remainder = Math.abs(v - $scope.defaultTick) % $scope.tickInterval;
            var minutes = remainder * 15;   // 15 minutes
            var hours = (Math.abs(parseInt(v) - $scope.defaultTick) - remainder) / $scope.tickInterval;

            var valString = hours + " hours and " + minutes + " minutes";
            if(v < $scope.hourRange * $scope.tickInterval) {
                valString = " - " + valString;
            }

            return valString;
        };
    }
]);

atoAlertnessControllers.controller('MyChargeController', ['$window', '$scope', '$location',
    function($window, $scope, $location) {

        $scope.numberOfDays = 14;
        $scope.hoursRange = [];

        for(var i = 0; i < 24; i++) {
            $scope.hoursRange.push(i);
        }

        $scope.minutesRange = [];

        for(var i = 0; i < 60; i++) {
            $scope.minutesRange.push(i);
        }

        $scope.items = [];

        for(var i = 0; i < $scope.numberOfDays; i++) {
            $scope.items.push(
                {
                    id: i + 1,
                    name: 'Day ' + (i + 1),
                    data: [
                        {starthour: 23, startminute: 0, durationhour: 8, durationminute: 0}
                    ]
                }
            );
        }



        $scope.addDay = function() {
            $scope.numberOfDays ++;
            $scope.items.push(
                {
                    id: $scope.numberOfDays,
                    name: 'Day ' + $scope.numberOfDays,
                    data: [
                        {starthour: 23, startminute: 0, durationhour: 8, durationminute: 0}
                    ]
                }
            );
        };

        $scope.addSleep = function(day){
            $scope.items[parseInt(day) - 1].data.push({starthour: 23, startminute: 0, durationhour: 8, durationminute: 0});
        }

        $scope.save = function() {
            console.log($scope.items);
        }
    }
]);
