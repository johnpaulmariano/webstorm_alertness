'use strict';

/*App services*/
var myServices = angular.module('atoAlertnessServices', []);

//defining constants
myServices.value("BASE_API_URL", 'http://atsaptest.cssiinc.com/alertness/svc/');

myServices.factory('TokenService', ['$http', 'BASE_API_URL', 
    function($http, BASE_API_URL){
        var service = {};
        
        service.getToken = function(callback){
            //$http.get('services.php?callback=getToken')
            $http.get(BASE_API_URL + 'user/getToken')
                .success(function(response){
                    //console.log(response);
                    callback(response);
                });
            };
            
        return service;
    }
]);

myServices.factory('ChangePasswordService', ['$http', 'BASE_API_URL',  
    function($http, BASE_API_URL) {
        var service = {};
        
        service.changePassword = function(username, password, callback) {
            $http.put(BASE_API_URL + 'user/changePassword', {username: username, password: password})
                .success(function(response){
                    //console.log('password changing');
                    //console.log(response);
                    callback(response);
                })
                .error(function(data, status, headers, config){
                    if(status == 401) {
                        callback({success: false, message: 'You must login first.', status: status});
                    }
                    else {
                        callback({success: false, message: 'Server connection error.', status: status});
                    }
                });
        };
        
        return service;
    }
]);
myServices.factory('AuthenticationService',
    ['BASE_API_URL', '$http', '$cookieStore', '$rootScope',
    function (BASE_API_URL, $http, $cookieStore, $rootScope) {
        var service = {};
        
        service.Login = function (username, password, rememberMe, callback) {
            //console.log('login in');
            $http.post(BASE_API_URL + 'user/login', {username: username, password: password, rememberMe: rememberMe})
                .success(function (response) {
                    //console.log(response);
                    callback(response);
                })
                .error(function(data, status, headers, config){
                    callback({success: false, message: 'Server connection error'});
                });
            
            
        };
        /*waiting for CSSI to enable email capturing */
        //service.Register = function(username, password, email, callback) {
        service.Register = function(username, password, callback) {
            //$http.put(BASE_API_URL + 'user/create', {username: username, password: password, email: email})
            $http.put(BASE_API_URL + 'user/create', {username: username, password: password})
                .success(function (response) {
                    //console.log('create user');
                    //console.log(response);
                    callback(response);
                })
                .error(function(data, status, headers, config){
                    callback({success: false, message: 'Server connection error'});
                });
        };
        
        service.SetCredentials = function (username, token) {
            //var authdata = Base64.encode(username + ':' + password);
            $rootScope.globals = {
                currentUser: {
                    username: username,
                    authdata: token
                }
            };
            $rootScope.logout = false;
            $http.defaults.headers.common.Authorization = 'Basic ' + token;
            $cookieStore.put('globals', $rootScope.globals);
        };

        service.ClearCredentials = function () {
            $rootScope.globals = {};
            $cookieStore.remove('globals');
            $http.defaults.headers.common.Authorization = 'Basic';
            //delete $http.defaults.headers.common.Authorization;
        };
        
        service.getUser = function(){
            var $global = $cookieStore.get('globals');
            var $user = {};
            
            if($global) {
                if($global.currentUser != undefined) {
                    $user = $global.currentUser;
                }
            }
            
            return $user
        };
        
        return service;
    }]);

myServices.factory('Base64', function () {
    var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

    return {
        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                    keyStr.charAt(enc1) +
                    keyStr.charAt(enc2) +
                    keyStr.charAt(enc3) +
                    keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);

            return output;
        },

        decode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                window.alert("There were invalid base64 characters in the input text.\n" +
                    "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                    "Expect errors in decoding.");
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            do {
                enc1 = keyStr.indexOf(input.charAt(i++));
                enc2 = keyStr.indexOf(input.charAt(i++));
                enc3 = keyStr.indexOf(input.charAt(i++));
                enc4 = keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }

                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";

            } while (i < input.length);

            return output;
        }
    };
});

myServices.factory('ProfileDataService',  ['$http', 'BASE_API_URL', 'GuestDataService', '$rootScope',
    function($http, BASE_API_URL, GuestDataService, $rootScope){
        var service = {};
        var asGuest = $rootScope.asGuest;
        
        service.getProfile = function(username, callback){
            if(!asGuest) {
                $http.get(BASE_API_URL + 'user/profile')
                    .success(function(response){
                        callback(response);
                    })
                    .error(function(data, status, headers, config){
                        callback({success: false, message: 'Server connection error'});
                    });
            }
            else {
                var data = GuestDataService.getCookie('profile');
                callback({result : "success", data: data});
            }
        };
        
        service.setProfile = function(username, chronoMorning, chronoEvening, callback){
            if(!asGuest) {
                $http.put(BASE_API_URL + 'user/profile', {chronoMorning: chronoMorning, chronoEvening: chronoEvening})
                    .success(function(response){
                        //console.log(response);
                        callback(response);
                    })
                    .error(function(data, status, headers, config){
                        callback({success: false, message: 'Server connection error'});
                    });
            }
            else {
                var chronotypeData = {chronoMorning: chronoMorning, chronoEvening: chronoEvening};
                GuestDataService.setCookie('profile', chronotypeData);
                callback({success : true, message: 'Chronotype data saved'});
            }
        };
        
        service.setEmail = function(username, email, callback){
            if(!asGuest) {
                $http.put(BASE_API_URL + 'user/profile', {email: email})
                    .success(function(response){
                        //console.log(response);
                        callback(response);
                    })
                    .error(function(data, status, headers, config){
                        callback({success: false, message: 'Server connection error'});
                    });
            }
            // not saving email for guest user
            /*else {
                var chronotypeData = {chronoMorning: chronoMorning, chronoEvening: chronoEvening};
                GuestDataService.setCookie('profile', chronotypeData);
                callback({success : true, message: 'Chronotype data saved'});
            }*/
        };
        
        return service;
    }
]);

myServices.factory('GuestDataService', ['$cookieStore', 
    function($cookieStore){
        
        var service = {};
        var cook = {
            profile: {},
            sleepNeed: {},
            sleepDebt: {},
            checklist: {}
        };
        
        var localCookie = $cookieStore.get("asGuestCookies");
        
        if(angular.isDefined(localCookie)) {
            for(var k in localCookie) {
                cook[k] = localCookie[k];
            }
        }
        
        service.setCookie = function(cookieName, cookieValue){
            cook[cookieName] = cookieValue;
            $cookieStore.put("asGuestCookies", cook);
        };
        
        service.getCookie = function(cookieName){
            return cook[cookieName];
        };
        
        return service;
    }
]);

myServices.factory('SleepNeedService', ['$http', 'BASE_API_URL', '$cookieStore', '$rootScope', 'GuestDataService',
    function($http, BASE_API_URL, $cookieStore, $rootScope, GuestDataService){
        var service = {};
        var asGuest = $rootScope.asGuest;
        
        service.setSleepNeed = function(sleepNeedData, callback){
            if(!asGuest) {
                $http.put(BASE_API_URL + 'data/sleepneed', sleepNeedData)
                    .success(function(response){
                        callback(response);
                    })
                    .error(function(data, status, headers, config){
                        callback({success: false, message: 'Server connection error'});
                    });
            }
            else {
                GuestDataService.setCookie('sleepNeed', sleepNeedData);
                callback({result : "success", message: 'Sleep Need data saved'});
            }
        };
        
        service.getSleepNeed = function(callback){
            if(!asGuest) {
                $http.get(BASE_API_URL + 'data/sleepneed')
                    .success(function(response){
                        callback(response);
                    })
                    .error(function(data, status, headers, config){
                        callback({success: false, message: 'Server connection error'});
                    });
            }
            else {
                var data = GuestDataService.getCookie('sleepNeed');
                callback({result : "success", data: data});
            }
        };
        return service;
    }
]);
/*warning: pre 1.4 angular js doesn't support set cookie expiration
 * and $cookieStore is deprecrated in > 1.4
 * */
myServices.factory('RememberMeService', ['$cookieStore', '$http', 'BASE_API_URL', 
    function($cookieStore, $http, BASE_API_URL){
        var service = {};
        var cookieName = 'alertness-rememberme';
        
        service.rememberMe = function(cookieValue, expiration) {
            /*var cookie = cookieName + '=';
            
            cookie += cookieValue + ';';

            var date = new Date();
            var time = date.getTime();
            time += expiration * 24 * 60 * 60 * 1000;
            date.setTime(time);
            document.cookie = cookieName + '='  + cookieValue + '; expires=' + date.toUTCString() + '; path=/';*/
            $cookieStore.put(cookieName, cookieValue);
        };
        
        service.forgetMe = function(){
            /*var cookie = cookieName + '=;';
            cookie += 'expires=' + (new Date()).toString() + ';';

            document.cookie = cookie;*/
            //console.log('forget me');
            $cookieStore.remove(cookieName);
        };
        
        service.authenticateMe = function(callback) {
            var cookieVal = $cookieStore.get(cookieName);
            
            if(cookieVal){
                //console.log('get remember me');
                $http.get(BASE_API_URL + 'user/rememberMe')
                    .success(function(response){
                        //console.log(response);
                        callback(response);
                    })
                    .error(function(response) {
                        callback({success: false, message: 'Server connection error'});
                    });
            }
            else {
                console.log('no remember me cookie');
            }
        };
        
        return service;
    }
]);

myServices.factory('SleepDebtService', ['$http', 'BASE_API_URL', 'GuestDataService', '$rootScope',
    function($http, BASE_API_URL, GuestDataService, $rootScope){
        var service = {};
        var asGuest = $rootScope.asGuest;
        
        service.setSleepDebt = function(sleepDebtData, callback){
            if(!asGuest) {
                $http.put(BASE_API_URL + 'data/sleepdebt', sleepDebtData)
                    .success(function(response){
                        callback(response);
                    })
                    .error(function(data, status, headers, config){
                        callback({success: false, message: 'Server connection error'});
                    });
            }
            else {
                GuestDataService.setCookie('sleepDebt', sleepDebtData);
                callback({success: true, message: 'Sleep Balance data saved'});
            }
        };
        
        service.getSleepNeed = function(callback){
            if(!asGuest) {
                $http.get(BASE_API_URL + 'data/sleepneed')
                    .success(function(response){
                        callback(response);
                    })
                    .error(function(data, status, headers, config){
                        callback({success: false, message: 'Server connection error'});
                    });
            }
            else {
                var data = GuestDataService.getCookie('sleepNeed');
                callback({result : "success", data: data});
            }
        };
        
        service.getSleepDebt = function(callback){
            if(!asGuest) {
                $http.get(BASE_API_URL + 'data/sleepdebt')
                    .success(function(response){
                        callback(response);
                    })
                    .error(function(data, status, headers, config){
                        callback({success: false, message: 'Server connection error'});
                    });
            }
            else {
                var data = GuestDataService.getCookie('sleepDebt');
                callback({success: true, data: data});
            }
        };
        return service;
    }
]);

myServices.factory('ChecklistService', ['$http', 'BASE_API_URL', 'GuestDataService', '$rootScope',
    function($http, BASE_API_URL, GuestDataService, $rootScope){
        var service = {};
        var asGuest = $rootScope.asGuest;
        
        service.getChecklist = function(username, callback) {
            if(!asGuest) {
                $http.get(BASE_API_URL + 'data/checklist')
                    .success(function(response){
                        callback(response);
                    })
                    .error(function(data, status, headers, config){
                        callback({success: false, message: 'Server connection error'});
                    });
            }
            else {
                var data = GuestDataService.getCookie('checklist');
                callback({result : "success", data: data});
            }
        };
        
        service.setChecklist = function(data, callback) {
            var submitData = {};
          
            angular.forEach(data, function(v, k){
                if(v != null) {
                    submitData[k] = v;
                }
            });
            
            if(!asGuest) {
                $http.put(BASE_API_URL + 'data/checklist', submitData)
                    .success(function(response){
                        callback(response);
                    })
                    .error(function(data, status, headers, config){
                        callback({success: "false", message: 'Server connection error'});
                    });
            }
            else {
                GuestDataService.setCookie('checklist', submitData);
                callback({success: "true", message: 'Checklist saved'});
            }
        };
        
        return service;
    }
]);

//ResetPasswordService
myServices.factory('ResetPasswordService', ['$http', 'BASE_API_URL', '$rootScope',
    function($http, BASE_API_URL, $rootScope){
        var service = {};
        
        service.resetPassword = function(email, callback) {
                $http.put(BASE_API_URL + 'user/resetpassword', {email: email})
                    .success(function(response){
                        callback(response);
                    })
                    .error(function(data, status, headers, config){
                        callback({success: false, message: 'Server connection error'});
                    });
        };
        
        return service;
    }
]);
