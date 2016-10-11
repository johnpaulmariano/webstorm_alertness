'use strict';

/*App services*/
var myServices = angular.module('atoAlertnessServices', []);



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

        service.Register = function(username, password, email, callback) {
            $http.put(BASE_API_URL + 'user/create', {username: username, password: password, email: email})
                .success(function (response) {
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

myServices.factory('ProfileDataService',  ['$http', 'BASE_API_URL', 'GuestDataService', '$rootScope', 'localStorageService',
    function($http, BASE_API_URL, GuestDataService, $rootScope, localStorageService){
        var service = {};
        var asGuest = $rootScope.asGuest;
        var storageKey = "Chronotype";

        service.getLocalData = function(username, callback) {
            var localData = localStorageService.get(storageKey);
            if(localData) {
                callback(localData);
            }
        };

        service.setLocalData = function(username, chronoMorning, chronoEvening, callback){
            var r = {
                username: username,
                chronoMorning: chronoMorning,
                chronoEvening: chronoEvening,
                success: true
            };

            localStorageService.set(storageKey, r);
        };

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
/*
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
*/

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
/*
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
*/
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
                    .error(function(response){
                        callback({success: false, message: ""});
                    });
        };

        return service;
    }
]);

myServices.factory('DataPredictionService', ['$http', 'BASE_API_URL', 'localStorageService', '$rootScope', 'PREDICTION_STATISTIC',
    function($http, BASE_API_URL, localStorageService, $rootScope, PREDICTION_STATISTIC){
        var service = {};
        var storageKey = 'PredictionData';
        var localExisted = true;

        service.getData = function(data, renew, timestamp, callback) {
            renew = true;

            if(!renew) {
                console.log('not renew');
                var localData = localStorageService.get(storageKey);

                if(localData) {
                    callback(localData);
                }
                else {
                    localExisted = false;
                }
            }

            if(!localExisted || renew){
                console.log('renew');
                //console.log(data);
                data.statistic = PREDICTION_STATISTIC;
                $http.put(BASE_API_URL + 'data/prediction',data)
                    .success(function(response){
                        var r = {
                            numDays: data.numDays,
                            time: timestamp,
                            data: response.message,
                        };

                        //store in local storage
                        if(response.success == "true") {
                            r.success = true;
                            localStorageService.set(storageKey, r);
                            callback(r);
                        }
                        else {
                            callback({success: false, message: 'Error: ' + response.message});
                        }
                    })
                    .error(function(data, status, headers, config){
                        callback({success: false, message: 'Server connection error'});
                    });
            }
        };


        return service;
    }
]);

myServices.factory('CaffeineService', ['$http', 'BASE_API_URL', '$rootScope',
    function($http, BASE_API_URL, $rootScope){
        var service = {};
        var caffeineItems = [
            {
                id: 1,
                itemName: "STARBUCKS COFFEE VENTI (20 oz.)",
                value: "410"
            },
            {
                id: 2,
                itemName: "STARBUCKS COFFEE GRANDE (16 oz.)",
                value: "330"
            },
            {
                id: 3,
                itemName: "STARBUCKS COFFEE TALL (12 oz.)",
                value: "260"
            },
            {
                id: 4,
                itemName: "STARBUCKS COFFEE SHORT (8 oz.)",
                value: "175"
            },
            {
                id: 5,
                itemName: "5-HOUR ENERGY SHOT REGULAR STRENGTH (1.93 oz.)",
                value: "200"
            },
            {
                id: 6,
                itemName: "5-HOUR ENERGY SHOT EXTRA STRENGTH (1.93 oz.)",
                value: "230"
            },
            {
                id: 7,
                itemName: "COCA-COLA 12-oz. CAN",
                value: "34"
            },
            {
                id:8,
                itemName: "COCA-COLA 16-oz. BOTTLE",
                value: "45"
            },
            {
                id: 9,
                itemName: "COCA-COLA 20-oz. BOTTLE",
                value: "57"
            },
            {
                id: 10,
                itemName: "LIPTON TEA REGULAR BLACK TEA (8 oz.)",
                value: "55"
            },
            {
                id: 11,
                itemName: "LIPTON TEA NATURAL ENERGY PREMIUM BLACK TEA (8 oz.)",
                value: "75"
            },
            {
                id: 12,
                itemName: "LIPTON TEA PURE GREEN TEA (8 oz.)",
                value: "35"
            },
            {
                id: 13,
                itemName: "LIPTON TEA COLD BREW TEA (8 oz.)",
                value: "10"
            }
        ];

        service.getData = function(data, callback) {
            /*$http.get(BASE_API_URL + 'blah blah')
                .success(function(response){
                    callback(response);
                })
                .error(function(data, status, headers, config){
                    callback({success: false, message: 'Server connection error'});
                });*/

            return caffeineItems;
        };

        service.getItem = function(itemID, callback){
            for(var i = 0; i < caffeineItems.length; i++)
            {
                if(caffeineItems[i].id == itemID) {
                    return caffeineItems[i];
                }
            }

            return caffeineItems[0];
        }

        return service;
    }
]);

myServices.factory('MyChargeService', ['$http', 'BASE_API_URL', '$rootScope','localStorageService',
    function($http, BASE_API_URL, $rootScope, localStorageService){
        var service = {};
        var storageKey = 'MyChargeData';

        //retrieve from local storage
        service.getData = function(callback) {
            var localData = localStorageService.get(storageKey);
            callback(localData);
        };

        service.setData = function(data, callback) {
            localStorageService.set(storageKey, data);
            callback({success: true});
        };

        return service;
    }
]);

myServices.factory('MeqService', ['$http', 'BASE_API_URL', '$rootScope', 'localStorageService',
    function($http, BASE_API_URL, $rootScope, localStorageService){
        var service = {};
        var storageKey = 'MEQData';
        var asGuest = $rootScope.asGuest;

        service.getData = function(callback) {
            if(!asGuest) {
                $http.get(BASE_API_URL + 'data/meq')
                    .success(function(response){
                        callback(response);
                    })
                    .error(function(data, status, headers, config){
                        callback({success: false, message: 'Server connection error'});
                    });
            }
            else {
                var localData = localStorageService.get(storageKey);
                callback({success: true, data: localData});
            }
        };

        service.setData = function(data, callback) {
            if(!asGuest) {
                $http.put(BASE_API_URL + 'data/meq', data)
                    .success(function(response){
                        callback(response);
                    })
                    .error(function(data, status, headers, config){
                        callback({success: false, message: 'Server connection error'});
                    });
            }
            else {
                localStorageService.set(storageKey, data);
                callback({success: true});
            }
        };

        return service;
    }
]);

myServices.factory('EssService', ['$http', 'BASE_API_URL', '$rootScope', 'localStorageService',
    function($http, BASE_API_URL, $rootScope, localStorageService){
        var service = {};
        var storageKey = 'ESSData';
        var asGuest = $rootScope.asGuest;

        service.getData = function(callback) {
            if(!asGuest) {
                $http.get(BASE_API_URL + 'data/ess')
                    .success(function(response){
                        callback(response);
                    })
                    .error(function(data, status, headers, config){
                        callback({success: false, message: 'Server connection error'});
                    });
            }
            else {
                var localData = localStorageService.get(storageKey);
                callback({success: true, data: localData});
            }
        };

        service.setData = function(data, callback) {
            if(!asGuest) {
                $http.put(BASE_API_URL + 'data/ess', data)
                    .success(function(response){
                        callback(response);
                    })
                    .error(function(data, status, headers, config){
                        callback({success: false, message: 'Server connection error'});
                    });
            }
            else {
                localStorageService.set(storageKey, data);
                callback({success: true});
            }
        };


        return service;
    }
]);

myServices.factory('MyChargeDataService', ['$http', 'BASE_API_URL', '$rootScope', 'localStorageService', 'moment',
    'DEFAULT_PREDICTION_DAYS', 'DEFAULT_SLEEP_START', 'DEFAULT_SLEEP_END', 'DEFAULT_SLEEP_DURATION',
    function($http, BASE_API_URL, $rootScope, localStorageService, moment, DEFAULT_PREDICTION_DAYS, DEFAULT_SLEEP_START,
             DEFAULT_SLEEP_END, DEFAULT_SLEEP_DURATION){

        var service = {};
        var asGuest = $rootScope.asGuest;
        var storageKey = 'MyChargeDataCalendar';
        //var asGuest = true;

        service.getData = function(callback) {
            if(!asGuest) {
                $http.get(BASE_API_URL + 'data/mycharge')
                    .success(function(response){
                        callback(response);
                    })
                    .error(function(data, status, headers, config){
                        callback({success: false, message: 'Server connection error'});
                    });
            }
            else {
                var localData = localStorageService.get(storageKey);
                if(localData == null) {
                    localData = [];
                }
                callback({success: "true", data: localData});
            }
        };

        service.setData = function(data, callback) {
            if(!asGuest) {
                $http.put(BASE_API_URL + 'data/mycharge', data)
                    .success(function(response){
                        callback(response);
                    })
                    .error(function(data, status, headers, config){
                        callback({success: false, message: 'Server connection error'});
                    });
            }
            else {
                localStorageService.set(storageKey, data);
                callback({success: true});
            }
        };

        service.prepareSubmissionData = function(startDate, endDate, callback) {
            var eventData = [];

            service.getData(function(response){
                console.log(response);
                if(response.success == "true") {
                    eventData = response.data;
                }
            });

            eventData.sort(function(a, b){
                return a.tsStart - b.tsStart;
            });

            var sleepData = [];
            var coffeeData = [];

            //filter events started later than start date and earlier than end date
            for(var i = 0; i < eventData.length; i++) {
                if(eventData[i].tsStart >= startDate.getTime() && eventData[i].tsStart <= endDate.getTime()) {
                    var dObj = eventData[i];
                    if(eventData[i].dataType == 'sleep'){
                        sleepData.push(dObj);
                    }
                    else if(eventData[i].dataType == 'caffeine'){
                        coffeeData.push(dObj);
                    }
                }
            }

            //filling default sleep events
            for(var j = 0; j <= DEFAULT_PREDICTION_DAYS; j++) {
                var zeroHour = startDate.getTime() + j * 24 * 60 * 60 * 1000;
                var found = false;
                var startSleepHour = zeroHour + DEFAULT_SLEEP_START * 60 * 60 * 1000;
                var nextDaySleepEnd = startSleepHour + DEFAULT_SLEEP_DURATION * 60 * 60 * 1000;

                for(var i = 0; i < sleepData.length; i++) {
                    /*condition - no overlap to default sleep start and end
                     + start < default start  && end > default end
                     + default start < start < default end
                     + default start < end < default end
                     */
                    if ((sleepData[i].tsStart < startSleepHour && sleepData[i].tsEnd > nextDaySleepEnd)
                        || (sleepData[i].tsStart > startSleepHour && sleepData[i].tsStart < nextDaySleepEnd)
                        || (sleepData[i].tsEnd > startSleepHour && sleepData[i].tsEnd < nextDaySleepEnd)) {
                        found = true;
                        break;
                    }
                }

                if(!found){
                    //console.log('push in array');
                    var paddingSleep = {
                        tsStart: startSleepHour,
                        tsEnd: nextDaySleepEnd,
                        dataType: 'sleep'
                    };

                    sleepData.push(paddingSleep);
                }
            }

            sleepData.sort(function(a, b){
                return a.tsStart - b.tsStart;
            });

            console.log(sleepData);

            var startTime = startDate.getTime();
            var milInHour = 60 * 60 * 1000; //milliseconds in an hour

            //processing coffee time
            var caffeineDoses = [];
            var caffeineTimes = [];
            var caffeineItems = [];
            for(var cc = 0; cc < coffeeData.length; cc++) {
                //console.log(coffeeData[cc]);
                var coffeeStart = (coffeeData[cc].tsStart - startTime)/milInHour;
                caffeineTimes.push(coffeeStart);
                caffeineDoses.push(coffeeData[cc].amount);
                caffeineItems.push(coffeeData[cc].source);
            }

            //transform sleep data into array
            var sleepWakeSchedule = [];
            var sleepStartTime = 0;

            for(var cn = 0; cn < sleepData.length; cn++) {
                sleepData[cn].start = (sleepData[cn].tsStart - startTime)/milInHour;
                sleepData[cn].end = (sleepData[cn].tsEnd - startTime)/milInHour;
                if(sleepData[cn].tsEnd == sleepData[cn].tsStart) { // zero sleep, therefore look for the next sleep start
                    if(cn == 0) {
                        sleepStartTime = (sleepData[cn].tsStart - startTime)/milInHour;
                        sleepWakeSchedule.push((sleepData[cn].tsEnd - sleepData[cn].tsStart)/milInHour);

                    }
                    else {
                        var wakeTime = ((sleepData[cn].tsStart - sleepData[cn-1].tsEnd) + (sleepData[cn+1].tsStart - sleepData[cn].tsEnd))/milInHour;
                        /*console.log('no sleep');
                        console.log((sleepData[cn].tsStart - sleepData[cn-1].tsEnd)/milInHour);
                        console.log((sleepData[cn+1].tsStart - sleepData[cn].tsEnd)/milInHour);*/
                        sleepWakeSchedule.push(wakeTime);

                        //push sleep period
                        sleepWakeSchedule.push((sleepData[cn+1].tsEnd - sleepData[cn+1].tsStart)/milInHour);
                        cn ++;
                    }
                }
                else {
                    if(cn == 0) {
                        sleepStartTime = (sleepData[cn].tsStart - startTime)/milInHour;
                        sleepWakeSchedule.push((sleepData[cn].tsEnd - sleepData[cn].tsStart)/milInHour);
                    }
                    else {

                        //push awake period
                        sleepWakeSchedule.push((sleepData[cn].tsStart - sleepData[cn-1].tsEnd)/milInHour);
                        //push sleep period
                        sleepWakeSchedule.push((sleepData[cn].tsEnd - sleepData[cn].tsStart)/milInHour);
                    }

                }
            }

            console.log('sleep data ');
            console.log(sleepData);

            var outputData = {
                data: {
                    sleepStartTime: sleepStartTime,
                    sleepWakeSchedule: sleepWakeSchedule,
                    caffeineDoses: caffeineDoses,
                    caffeineTimes: caffeineTimes,
                    caffeineItems: caffeineItems,
                    //numDays: DEFAULT_PREDICTION_DAYS + 1
                },
                timestamp: startDate
            };

            console.log(outputData);

            callback({success: true, data: outputData});

        };

        return service;
    }
]);
