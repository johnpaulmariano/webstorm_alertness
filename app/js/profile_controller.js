/**
 * Created by trieutran on 7/1/16.
 */
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
