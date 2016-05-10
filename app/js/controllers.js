'use strict';
/* Controllers */

var atoAlertnessControllers = angular.module('atoAlertnessControllers', []);

atoAlertnessControllers.controller('ApplicationController', ['$scope', '$rootScope', '$location', 'AuthenticationService', 'RememberMeService', 'localStorageService',
    function($scope, $rootScope, $location, AuthenticationService, RememberMeService, localStorageService){
        $rootScope.appError = '';
        $rootScope.appMessage = '';
        $rootScope.renewPrediction = false;
        $rootScope.showSplash = false;

        var splashKey = "SplashKey";
        var splashShown = localStorageService.get(splashKey);

        if(splashShown) {
            $rootScope.showSplash = false;
        }
        else {
            $rootScope.showSplash = true;
            localStorageService.set(splashKey, true);
        }
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
        $scope.showSplash = $rootScope.showSplash;
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
            $scope.username = angular.lowercase($scope.username);
        });
        
        $scope.login = function () {
            $scope.dataLoading = true;
            $rootScope.asGuest = false;
            $cookieStore.remove("asGuestCookies");
            AuthenticationService.Login($scope.username, $scope.password, $scope.rememberMe, function (response) {
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
/*
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
]);*/
/* don't use sleep debt anymore - will be removed
*
**/
/*
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

            return $postData;
        };
        
        $scope.setChecklist = function(){
            var $data = $scope.prepareData();

            ChecklistService.setChecklist($data, 
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

/*atoAlertnessControllers.controller('DashboardController', ['$rootScope', '$scope', '$location', 'ProfileDataService', 'SleepNeedService', 'SleepDebtService',
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
]);*/

/*atoAlertnessControllers.controller('GaugeController', ['$window', '$scope', '$location',
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
]);*/

atoAlertnessControllers.controller('Gauge2Controller', ['$window', '$rootScope', '$scope', '$location', 'DataPredictionService', 'MyChargeService','usSpinnerService', 'PREDICTION_DATA_EXPIRATION',
    function($window, $rootScope, $scope, $location, DataPredictionService, MyChargeService, usSpinnerService, PREDICTION_DATA_EXPIRATION) {
        //initiate vars for sliders
        $scope.hourRange = 24;
        $scope.tickInterval = 4;
        $scope.step = 1;
        $scope.defaultTick = 0;
        $scope.minRange = 0;
        $scope.maxRange = 0;
        $scope.sliderVal = undefined;
        $scope.sliderValText = "0";
        $scope.dataTimeStamp = null;
        $scope.gaugeText = '';
        $scope.isExpired = false;
        //$scope.expiredIn = 72 * 60 * 60 * 1000; // expired within 3 days
        $scope.expiredIn = PREDICTION_DATA_EXPIRATION;

        var d = new Date();
        $scope.currentTime = d.toLocaleString();
        $scope.format = 'M/d/yy h:mm:ss a';

        $scope.initializeGauge = function() {
            $scope.gauge = {};
            $scope.gauge.value = 2;
            $scope.gauge.upperLimit = 6;
            $scope.gauge.lowerLimit = 2;
            $scope.gauge.unit = "";
            $scope.gauge.precision = 2;

            $scope.gauge.ranges = [
                {
                    min: 2,
                    max: 2.8,
                    color: '#bc1705'
                },
                {
                    min: 2.8,
                    max: 3.6,
                    color: '#ae4c0f'
                },
                {
                    min: 3.6,
                    max: 4.4,
                    color: '#a07e1a'
                },
                {
                    min: 4.4,
                    max: 5.2,
                    color: ' #95ab23'
                },
                {
                    min: 5.2,
                    max: 6,
                    color: '#8ec929'
                }
            ];
        };

        $scope.filterData = function(r){
            // calculate the beginning of TS day
            var ts = new Date(r.time);
            var begTS = new Date(ts.getFullYear(), ts.getMonth(), ts.getDate(), 0, 0, 0, 0);
            var endTS = new Date(begTS.getTime() + $scope.expiredIn);

            var d = new Date();
            var currMinutes = d.getMinutes();
            var currHours = d.getHours();
            var currHourFraction = 0;

            if(currMinutes >= 0 && currMinutes < 7) {
                currHourFraction = 0;
            }
            else if(currMinutes >= 7 && currMinutes < 22) {
                currHourFraction = 0.25;
            }
            else if(currMinutes >= 22 && currMinutes < 37) {
                currHourFraction = 0.5;
            }
            else if(currMinutes >= 37 && currMinutes < 52) {
                currHourFraction = 0.75;
            }
            else {
                currHourFraction = 1;
            }

            if(currHourFraction == 1) {
                currHours ++;
                currHourFraction = 0;
            }

            var newCurrDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), currHours, currHourFraction * 60, 0, 0);

            //check if data is expired
            console.log(endTS);
            console.log(newCurrDate);
            if(newCurrDate.getTime() > endTS.getTime()) {
                $scope.isExpired = true;
            }

            //calculate the mid point of the slider based on approx. current time
            var currentTimeSlot = r.numDays * 24 + currHours + currHourFraction;
            console.log(currentTimeSlot);

            //search for the middle point
            var midPoint = 0;
            for(var i = 0; i < r.data.length; i++) {
                if(r.data[i].time < currentTimeSlot) {
                    continue;
                }
                else {
                    midPoint = i;
                    break;
                }
            }
            console.log(midPoint);
            console.log(r.data.length);

            //calculate the beggining and ending point of slider
            var startPoint = 0;
            var timeStartPoint = 0;
            var endPoint = r.data.length -  1;
            if(midPoint - 2 * 24 * 4 > 0) {
                startPoint = midPoint - 2 * 24 * 4;
                timeStartPoint = newCurrDate.getTime() - (r.data[midPoint].time - r.data[startPoint].time) * 60 * 60 * 1000;
            }

            if(midPoint + 2 * 24 * 4 + 1 < r.data.length) {
                endPoint = midPoint + 2 * 24 * 4 + 1;
            }

            console.log(endPoint);

            $scope.sliderVal = midPoint - startPoint;
            $scope.defaultTick = $scope.sliderVal;

            var data = r.data.slice(startPoint, endPoint);

            for(var j = 0; j < data.length; j++) {
                if(data[j].value <= 2) {
                    data[j].value = 2;
                }
                else if(data[j].value >= 6) {
                    data[j].value = 6;
                }

                data[j].epoch = timeStartPoint + 15 * 60 * 1000 * j;
            }

            return data;
        };

        $scope.data = [];
        $scope.requestData = {};

        MyChargeService.getData(function(d){
            //padding 3 days for predictions
            var paddingThreeDays = function(sleepWake){
                //extracting the last sleep
                var last = sleepWake[sleepWake.length - 1];
                sleepWake.splice(sleepWake.length, 0, 24 - last, 8, 16, 8, 16, 8);

                return sleepWake;
            };

            if(d){
                $scope.requestData = d.data;
                $scope.requestData.sleepWakeSchedule = paddingThreeDays($scope.requestData.sleepWakeSchedule);
            }
            else {
                //default data to send to the prediction API
                var defaultSleepWake = [8.0,16,8.0, 16, 8.0, 16, 8, 16, 8, 16,8, 16, 8, 16, 8, 16, 8, 16, 8, 16, 8, 16, 8, 16, 8, 16, 8];
                defaultSleepWake = paddingThreeDays(defaultSleepWake);
                $scope.requestData = {
                    sleepStartTime: 23,
                    sleepWakeSchedule:defaultSleepWake,
                    caffeineDoses:[],
                    caffeineTimes:[],
                    numDays: 14
                };
            }
        });

        $scope.setGaugeText = function(d) {
            $scope.gaugeText =  d.epoch;
        };

        $scope.showSpinner = true;

        var GetPredictionData = function() {
            DataPredictionService.getData($scope.requestData, $rootScope.renewPrediction,
                function(response){
                    if(response.success == true) {
                        $scope.showSpinner = false;
                        $rootScope.renewPrediction = false; // turn off the renew prediction request from MyCharge inputs
                        $scope.data = $scope.filterData(response);

                        if($scope.data.length > 0) {
                            var ts = new Date(response.time);
                            $scope.dataTimeStamp = ts.toLocaleString();

                            //initiate vars for gauge
                            $scope.initializeGauge();

                            $scope.maxRange = $scope.data.length - 1;
                            $scope.gauge.value = $scope.data[$scope.defaultTick].value;
                            $scope.setGaugeText($scope.data[$scope.defaultTick]);

                            //slider config
                            //$scope.settingSlider();
                            $scope.minSlider = {
                                minValue: $scope.minRange,
                                maxValue: $scope.maxRange,
                                value: $scope.sliderVal,
                                options: {
                                    floor: $scope.minRange,
                                    ceil: $scope.maxRange,
                                    step: $scope.step,
                                    //showTicks: true,
                                    translate: function(value){
                                        return $scope.getSlideVal(parseInt(value));
                                    },
                                    onChange: function() {
                                        var idx = $scope.minSlider.value;
                                        if(idx == $scope.data.length) {
                                            idx = idx-1;
                                        }
                                        $scope.gauge.value = $scope.data[idx].value;
                                        $scope.setGaugeText($scope.data[idx]);
                                    }
                                }
                            };
                        }


                    }
                    else {
                        $scope.error = response.message;
                        $scope.showSpinner = false;
                    }
                }
            );
        };

        GetPredictionData();

        $scope.getSlideVal = function(v){
            var valString = '';
            if(v == $scope.defaultTick) {
                valString = '';
            }
            else {
                var diff = v - $scope.defaultTick;
                var fraction = diff % 4;
                var hour = (diff - fraction) /4;
                var min = fraction * 15;
                var minStr = Math.abs(min);

                if(minStr < 10) {
                    minStr = "0" + minStr;
                }

                valString = (diff > 0 ? "" : "-") + Math.abs(hour) + " hour(s) " + minStr + " min(s)";
            }

            return valString;
        };

        $scope.resetGauge = function(){
            console.log('reset');
            $rootScope.renewPrediction = true;
            GetPredictionData();
            $scope.isExpired = false;
        };
    }
// display a clock
]).directive('alertnessCurrentTime',  ['$interval', 'dateFilter',
    function($interval, dateFilter) {

        function link(scope, element, attrs) {
            var format,
                timeoutId;

            function updateTime() {
                element.text(dateFilter(new Date(), format));
            }

            scope.$watch(attrs.alertnessCurrentTime, function(value) {
                format = value;
                updateTime();
            });

            element.on('$destroy', function() {
                $interval.cancel(timeoutId);
            });

            // start the UI update process; save the timeoutId for canceling
            timeoutId = $interval(function() {
                updateTime(); // update DOM
            }, 1000);
        }

        return {
            link: link
        };
    }
]);

atoAlertnessControllers.controller('MyChargeController', ['$window', '$rootScope', '$scope', '$location', '$anchorScroll', '$uibModal','MyChargeService', 'CaffeineService', 'DataPredictionService',
    function($window, $rootScope, $scope, $location, $anchorScroll,$uibModal, MyChargeService, CaffeineService, DataPredictionService) {

        $scope.sleeps = [];
        $scope.caffeine = [];
        $scope.message = "";
        $scope.numberOfDays = 14;
        $scope.defaultStartSleepHour = 23;
        $scope.defaultStartSleepMinute = 0;
        $scope.defaultDurationHour = 8;
        $scope.defaultDurationMinute = 0;
        $scope.errorDays = [];


        $scope.convertSleepTime = function(day, startHour, startMinute, durationHour, durationMinute){
            var startTime = day * 24 * 60 + startHour * 60 + startMinute;
            var durationTime = (durationHour) * 60 + durationMinute;
            var endTime = startTime + durationTime;

            return {
                startHour: startHour,
                startMinute: startMinute,
                durationHour: durationHour,
                durationMinute: durationMinute,
                startTime: startTime,
                endTime: endTime,
                durationTime: durationTime
            };
        };

        $scope.formatTwoDigits = function(digit){
            if(digit < 10) {
                return "0" + digit;
            }
            else {
                return digit;
            }
        };

        $scope.createTimeDropdown = function(day, type) {
            var limit = 0;
            var multiplier = 0;

            if(type == 'minute') {
                limit = 60;
                multiplier = day * 24 * 60;
            }
            else if(type = 'hour') {
                limit = 24;
                multiplier = day * 24;
            }
            var timeOptions = [];

            for(var i = 0; i < limit; i++) {
                timeOptions.push(
                    {
                        val: multiplier + i,
                        txt: $scope.formatTwoDigits(i)
                    }
                );
            }

            return timeOptions;
        };

        $scope.createSleepDropdown = function(day, sHour, sMin, dHour, dMin) {
            var sleepObj = {
                day: day,
                selStartHour: {
                    val: sHour
                },
                selDurationHour: {
                    val: dHour
                },
                selStartMin: {
                    val: sMin
                },
                selDurationMin: {
                    val: dMin
                },
                startHours: $scope.createTimeDropdown(0, 'hour'),
                startMins: $scope.createTimeDropdown(0, 'minute'),
                durationHours: $scope.createTimeDropdown(0, 'hour'),
                durationMins: $scope.createTimeDropdown(0, 'minute')
            };

            return sleepObj;
        };

        $scope.createDayDropdown = function() {
            var arr = [];
            for(var i = 0; i < $scope.numberOfDays; i++) {
                arr.push(
                    {
                        txt: i + 1,
                        val: i
                    }
                );
            }

            return arr;
        };

        //get saved data
        MyChargeService.getData(function(d){
            if(d){
                $scope.sleeps = d.rawData.sleeps;
                $scope.caffeine = d.rawData.drinks;
                $scope.numberOfDays = d.rawData.numberOfDays;
            }
            else {
                //initiate sleeps && caffeine
                for(var i = 0; i < $scope.numberOfDays; i++) {
                    var daySleep = [];
                    daySleep.push($scope.convertSleepTime(0, $scope.defaultStartSleepHour, $scope.defaultStartSleepMinute,
                        $scope.defaultDurationHour, $scope.defaultDurationMinute));

                    $scope.sleeps.push(daySleep);
                    $scope.caffeine.push(null);
                }
            }
        });

        $scope.addSleep = function() {
            var modalInstance = $uibModal.open({
                //animation: $scope.animationsEnabled,
                windowTemplateUrl: './templates/modal/window.html',
                templateUrl: 'sleepModal.html',
                controller: 'MyChargeModelController',
                backdrop: false,
                size: 'small',
                resolve: {
                    dayDropdowns: function() {
                        var $arr = $scope.createDayDropdown();
                        return $arr;
                    },
                    dropdowns: function () {
                        return $scope.createSleepDropdown(0, $scope.defaultStartSleepHour, $scope.defaultStartSleepMinute,
                            $scope.defaultDurationHour, $scope.defaultDurationMinute);
                    },
                    sleeps: function(){
                        return $scope.sleeps;
                    },
                    errorDays: function(){
                        return $scope.errorDays;
                    }
                }
            });

            modalInstance.result.then(function (msg) {
                    $scope.message = msg;
                }, function(){
                }
            );
        };

        $scope.removeSleep = function(day, sleep) {
            var daySleep = $scope.sleeps[day];
            $scope.sleeps[day].splice(sleep, 1);
            $scope.errorDays = [];
            $scope.message = "Sleep Time Removed in Day" + (day + 1);
            $window.confirm("Are you sure to remove this entry?");
        };

        $scope.removeDay = function(day) {
            $scope.errorDays = [];
            $scope.sleeps.splice(day, 1);
            $scope.caffeine.splice(day, 1);
            $scope.numberOfDays --;
            $window.confirm("Are you sure to remove Day " + (day + 1) + "?");
            $scope.message = "Day " + (day + 1) + " Removed";
        }

        $scope.addDay = function() {
            $scope.errorDays = [];
            $scope.sleeps.push([$scope.convertSleepTime(0, $scope.defaultStartSleepHour, $scope.defaultStartSleepMinute,
                $scope.defaultDurationHour, $scope.defaultDurationMinute)]);
            $scope.caffeine.push(null);
            $scope.numberOfDays ++;

            $scope.message = "Day" + ($scope.numberOfDays) + " Added";
        };

        $scope.$watch('sleeps', function(){

            for(var i = 0; i < $scope.sleeps.length; i++) {
                $scope.sleeps[i].sort(function(a, b){
                    a = a.startTime;
                    b = b.startTime;

                    return a - b;
                });
            }
        }, true);

        $scope.createCaffeineDropdown = function(day, sHour, sMin, CaffeineService) {
            var caffeineItems = CaffeineService.getData();
            var quantity = [];

            for(var i = 1; i <= 10; i++) {
                quantity.push(i);
            }

            var caffeineObj = {
                startHours: $scope.createTimeDropdown(0, 'hour'),
                startMins: $scope.createTimeDropdown(0, 'minute'),
                caffeineItems: caffeineItems,
                quantity: quantity
            };

            return caffeineObj;
        };

        $scope.addCaffeine = function() {
            var modalInstance = $uibModal.open({
                //animation: $scope.animationsEnabled,
                windowTemplateUrl: './templates/modal/window.html',
                templateUrl: 'caffeineModal.html',
                controller: 'CaffeineModelController',
                backdrop: false,
                size: 'small',
                resolve: {
                    dayDropdowns: function() {
                        var $arr = $scope.createDayDropdown();
                        return $arr;
                    },
                    dropdowns: function () {
                        return $scope.createCaffeineDropdown(0, 0, 0, CaffeineService);
                    },
                    caffeine: function(){
                        return $scope.caffeine;
                    }
                }
            });

            modalInstance.result.then(function (msg) {
                $scope.message = msg;
            }, function () {
                //console.log('Modal dismissed at: ' + new Date());
            });
        };

        $scope.removeCaffeine = function(day, coffee){
            var dayCoffee = $scope.caffeine[day];

            $scope.caffeine[day].splice(coffee, 1);
            $window.confirm("Are you sure to remove this entry?");
            $scope.message = "Caffeine Drink Removed";
        }

        $scope.processCaffeine = function(){
            var coffeeData = [];
            for(var i = 0; i < $scope.caffeine.length; i++) {
                if($scope.caffeine[i]) {
                    for(var j = 0; j < $scope.caffeine[i].length; j++ ) {
                        var caffeineObj = {};
                        var drink = $scope.caffeine[i][j];

                        //if any caffeine entry is missing, simply ignore that caffeine input entirely
                        if(drink) {
                            if (drink.amount && drink.quantity && angular.isNumber(drink.hour) && angular.isNumber(drink.hour)) {
                                caffeineObj.dose = parseInt(drink.amount) * parseInt(drink.quantity);
                                caffeineObj.time = (parseInt(drink.hour) + 24 * i) + parseInt(drink.minute)/60;

                                coffeeData.push(caffeineObj);
                            }
                        }
                    }
                }
            }

            coffeeData.sort(function(a, b){
                a = a.time;
                b = b.time;

                return a - b;
            });

            var data = {
                doses: [],
                time: []
            };

            for(var k = 0; k < coffeeData.length; k++) {
                data.doses.push(coffeeData[k].dose);
                data.time.push(coffeeData[k].time)
            }

            return data;
        };

        $scope.validateData = function(){
            var output = {};
            var ok = false;
            var timeline = [];

            //expecting data format
            //{
            // “sleepStartTime”: 23,
            // “sleepWakeSchedule”:[ 8.0,40.0,8.0,12.0],
            // “caffeineDoses”:[ 100.0,200.0,100.0],
            // “caffeineTimes”:[ 32.0,48.0,51.0]
            // }
            try {
                for(var i = 0; i < $scope.sleeps.length; i++) {
                    var dataDay = [];
                    var day = $scope.sleeps[i];

                    for(var j = 0; j < day.length; j++) {
                        var sleepObj = {};
                        sleepObj.start = day[j].startTime + 24 * 60 * i;
                        sleepObj.duration = day[j].durationTime;
                        sleepObj.end = sleepObj.start + day[j].durationTime;
                        sleepObj.dayID = i;
                        sleepObj.slotID = j;

                        dataDay.push(sleepObj);
                    }

                    dataDay.sort(function(a, b){
                        a = a.start;
                        b = b.start;

                        return a - b;
                    });

                    var err = false;

                    //scan through dataday, if any overlapsed time, raise flag and bail out
                    for(var k = 1; k < dataDay.length; k ++) {
                        if(dataDay[k].start < dataDay[k-1].end) {
                            if($scope.errorDays.indexOf(dataDay[k].dayID) == -1) {
                                $scope.errorDays.push(dataDay[k].dayID);
                                err = true;
                                break;
                            }
                        }
                    }

                    if(!err) {
                        timeline[i] = dataDay;
                    }

                    if(err) {
                        throw new Error("Invalid Entry in sleep", "day " + (i+1));
                    }
                };
            } catch(e) {
                console.log(e.name+":  " + e.message);
            }

            if($scope.errorDays.length == 0) {      //checking day entries from the 2nd day
                try {
                    for(var i = 1; i < timeline.length; i ++) {
                        var prevLen = timeline[i - 1].length;
                        //check the end of the last slot of previous day with the beginning of the first slot
                        if(timeline[i -1][prevLen - 1].end > timeline[i][0].start) {
                            if($scope.errorDays.indexOf(i) == -1) {
                                $scope.errorDays.push(i);
                            }
                            throw new Error("Invalid Entry in day" + (i +1));
                        }
                    }
                } catch(e) {
                    console.log(e.name+":  " + e.message);
                }

            }

            var output = {
                sleepStartTime: null,
                sleepWakeSchedule: [],
                caffeineDoses: [],
                caffeineTimes: [],
                numDays: $scope.numberOfDays
            };
            var sleepData = [];
            if($scope.errorDays.length == 0) {
                for(var j = 0; j < timeline.length; j++) {
                    for(var m = 0; m < timeline[j].length; m++) {
                        sleepData.push(timeline[j][m].start/60);
                        sleepData.push(timeline[j][m].duration/60);
                        sleepData.push(timeline[j][m].end/60);
                    }
                }

                var sData = [];

                output.sleepStartTime = sleepData[0];
                sleepData.shift();
                for(var a = 0; a < sleepData.length; a++) {
                    if(a % 3 == 1) {
                        if(a < sleepData.length - 1) {
                            var wake = sleepData[a+1] - sleepData[a];
                            sData.push(wake);
                        }
                    }
                    else if(a % 3 == 2) {
                        //do nothing
                        //console.log(sleepData[a]);
                    }
                    else {
                        sData.push(sleepData[a])
                    }
                }

                output.sleepWakeSchedule = sData;

                var drinks = $scope.processCaffeine();
                output.caffeineDoses = drinks.doses;
                output.caffeineTimes = drinks.time;
                console.log(output);
                ok = true;
            }
            else {
                alert("Entry Error in Day " + ($scope.errorDays[0] + 1) + "!!!");
            }

            //not an ideal place to manipulate DOM here
            for(var i = 0; i < $scope.numberOfDays; i++) {
                if($scope.errorDays.indexOf(i) != -1) {
                    angular.element(document.querySelector("#day_title_" + i)).addClass("mycharge_error");
                }
                else {
                    angular.element(document.querySelector("#day_title_" + i)).removeClass("mycharge_error");
                }
            }

            return {
                success: ok,
                data: output,
                rawData: {
                    sleeps: $scope.sleeps,
                    drinks: $scope.caffeine,
                    numberOfDays: $scope.numberOfDays
                }
            };
        };

        $scope.save = function() {
            var result = $scope.validateData();
            if(result.success) {
                MyChargeService.setData(result, function(response){
                    //do nothing
                    $rootScope.renewPrediction = true;
                    $location.path("/gauge2");
                });

                /*DataPredictionService.getData(result.data, false,
                    function(response){
                        if(response.success == true) {
                            //re-route to gauge page
                            $location.path("/gauge2");
                        }
                        else {
                            $scope.message = response.message;
                        }
                    }
                );*/
            }
            else {
                $scope.messgae = "Error in data";
            }
        };
    }
]);

atoAlertnessControllers.controller('MyChargeModelController', ['$scope', '$uibModalInstance', 'dropdowns', 'sleeps', 'dayDropdowns','errorDays',
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

atoAlertnessControllers.controller('CaffeineModelController', ['$scope', '$uibModalInstance', 'caffeine', 'dropdowns', 'dayDropdowns',
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

atoAlertnessControllers.controller('MeqController', ['$window', '$scope', '$location', 'MeqService',
    function($window, $scope, $location, MeqService) {
        $scope.data = {};
        $scope.message = "";
        $scope.showForm = true;
        $scope.score = 0;
        $scope.type = '';

        for(var i = 1; i < 20; i++) {
            $scope["meq_" + i] = null;
        }

        MeqService.getData(function(data){
            if(data) {
                angular.forEach(data, function(v, k){
                    $scope.data[k] = v;
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
                if(!$scope.data["meq_" + i]) {
                    isValid = false;
                    $scope.message = "Missing entry";
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
    }
]);

atoAlertnessControllers.controller('EssController', ['$window', '$scope', '$location', 'EssService',
    function($window, $scope, $location, EssService) {
        $scope.data = {};
        $scope.message = "";
        $scope.showForm = true;
        $scope.score = 0;
        $scope.type = '';

        for(var i = 1; i < 9; i++) {
            $scope["ess_" + i] = null;
        }

        EssService.getData(function(data){
            if(data) {
                angular.forEach(data, function(v, k){
                    $scope.data[k] = v;
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
            for(var i = 1; i < 9; i++) {
                if(!$scope.data["ess_" + i]) {
                    isValid = false;
                    $scope.message = "Missing entry";
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
    }
]);

atoAlertnessControllers.controller('TestController', ['$window', '$rootScope', '$scope', '$location', 'DataPredictionService',
    function($window, $rootScope, $scope, $location, DataPredictionService) {
        //expecting data format
        $scope.scenario = 1;
        $scope.data = [];


        $scope.transformHours = function(h){
            var remainder = h % 1;
            var hour = h - remainder;
            hour = hour % 24;

            remainder = remainder * 60;
            if(remainder < 10) {
                remainder = "0" + remainder;
            }

            if(hour < 10) {
                hour = "0" + hour;
            }

            var hStr = hour + ':' + remainder;

            return hStr;
        };

        $scope.getData = function getData(scenario) {
            switch(scenario) {
                case 1:
                    var sleepStartTime = 23;
                    var sleepWakeSchedule = [8, 16, 8, 16, 8, 16, 8, 16, 8, 16, 8, 16, 8];
                    var numDays = 8;
                    var caffeineDoses = [];
                    var caffeineTime = [];
                    break;

                case 2:
                    var sleepStartTime = 23;
                    var sleepWakeSchedule = [8,40,8,40,8,16,8,40,8,16,8,16,8,16,8,16,8,16,8,16,8];
                    var numDays = 14;
                    var caffeineDoses = [];
                    var caffeineTime = [];
                    break;

                case 3:
                    var sleepStartTime = 23;
                    var sleepWakeSchedule = [8,16,8,16,8,16,8,16,8,16,8,16,8,16,8,16,8,16,8,16,8,16,8,16,8,16,8];
                    var numDays = 14;
                    var caffeineDoses = [820,165,230];
                    var caffeineTime = [10.116666666666667,296,320];
                    break;

                //
                case 4:
                    var sleepStartTime = 23;
                    var sleepWakeSchedule = [8,16,8,16,8,16,8,16,8,16,8,16,8,16,8,16,8,16,8,16,8,16,8,16,8,16,8,16,8,16,8,16,8,16,8];
                    var numDays = 18;
                    var caffeineDoses = [];
                    var caffeineTime = [];
                    break;
            }

            var paddingThreeDays = function(sleepWake){
                //extracting the last sleep
                var last = sleepWake[sleepWake.length - 1];
                sleepWake.splice(sleepWake.length, 0, 24 - last, 8, 16, 8, 16, 8);

                return sleepWake;
            };

            var result = {
                success: true,
                data: {
                    sleepStartTime: sleepStartTime,
                    sleepWakeSchedule:paddingThreeDays(sleepWakeSchedule),
                    caffeineDoses:caffeineDoses,
                    caffeineTimes:caffeineTime,
                    numDays:numDays
                },
                /*rawData: {
                 "sleeps": [
                 [{"startHour":23,"startMinute":0,"durationHour":8,"durationMinute":0,"startTime":1380,"endTime":1860,"durationTime":480}],
                 [{"startHour":23,"startMinute":0,"durationHour":8,"durationMinute":0,"startTime":1380,"endTime":1860,"durationTime":480}]
                 ],
                 "drinks":[null,null],
                 "numberOfDays":2
                 }*/
            };

            DataPredictionService.getData(result.data, true, function (response) {
                if (response.success == true) {
                    //$location.path("/gauge2");
                    console.log(response);
                    $scope.data = response.data;

                }
                else {
                    $scope.message = response.message;
                }
            });
        }

        $scope.getData($scope.scenario);

    }
]);