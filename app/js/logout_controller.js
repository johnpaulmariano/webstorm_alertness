/**
 * Created by trieutran on 7/1/16.
 */
atoAlertnessControllers.controller('LogoutController', ['$scope', '$rootScope', '$location', '$http', '$cookieStore', 'AuthenticationService', 'RememberMeService', 'TokenService',
    function ($scope, $rootScope, $location, $http, $cookieStore, AuthenticationService, RememberMeService, TokenService) {
        // reset login status
        $scope.logout = function () {
            RememberMeService.forgetMe();
            AuthenticationService.ClearCredentials();
            $cookieStore.remove('X-CSRF-TOKEN');
            $rootScope.logout = true;
            $rootScope.asGuest = false;
            $rootScope.isAuthenticated = false;

            $location.path('/login');
        };
    }
]);
