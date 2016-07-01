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