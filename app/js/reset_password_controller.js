/**
 * Created by trieutran on 7/1/16.
 */
atoAlertnessControllers.controller('ResetPasswordController', ['$rootScope', '$scope', '$location', 'ResetPasswordService',
    function($rootScope, $scope, $location, ResetPasswordService) {
        $scope.email = '';
        $scope.resetMessage = '';
        $scope.resetError = '';
        $scope.buttonHit = false;

        $scope.resetPassword = function(){
            $scope.buttonHit = true;
            ResetPasswordService.resetPassword($scope.email,
                function(response){
                    if(response.success == "true") {
                        $scope.resetMessage = response.message;
                    }
                    else {
                        $scope.resetError = response.message;
                    }
                });
        };

    }
]);