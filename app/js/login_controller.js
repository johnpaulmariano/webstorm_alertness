/**
 * Created by trieutran on 7/1/16.
 */

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
                        $rootScope.isAuthenticated = true;

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
                        $rootScope.isAuthenticated = false;
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
                    AuthenticationService.Register($scope.username, $scope.password, $scope.email,
                        //AuthenticationService.Register($scope.username, $scope.password,
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
