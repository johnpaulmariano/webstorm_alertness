/**
 * Created by trieutran on 7/1/16.
 */
atoAlertnessControllers.controller('NavBarController', ['$scope', '$rootScope',
    function($scope, $rootScope) {
        if($rootScope.asGuest == true) {
            $scope.asGuest = true;
        }
        else {
            $scope.asGuest = false;
        }

        if($rootScope.isAuthenticated == true) {
            $scope.isAuthenticated = true;
        }
        else {
            $scope.isAuthenticated = false;
        }
    }
]);