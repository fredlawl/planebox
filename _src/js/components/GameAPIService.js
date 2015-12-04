var storage = require('store');

PlaneBox.service('APIService', ['$http', function($http) {
    var url = window.data.apiURL;

    function makeCall (method, endpoint, data, callback) {
        var request,
            loginToken = storage.get('login-token'),
            config = {
                method: method,
                url: url + endpoint,
                data: data
            };

        if (typeof loginToken !== 'undefined') {
            config.headers = {
                Authorization: 'Bearer ' + loginToken
            }
        }

        request = $http(config).then(function(response){

            if (isFunction(callback))
                callback(response.data);

        }, function(data) {
            console.log('Error occurred making service request.')
        });
    }

    function setupPostObj (settings, obj) {
        //return $.extend({}, settings, data);
        return obj;
    }

    function isFunction (func) {
        return (typeof func !== 'undefined' && typeof func === 'function');
    }

     this.sendPictureStatistics = function (data, callback) {
         var settings = {
                 category: '',
                 picture: '',
                 won: 0
             },
             postObj = setupPostObj(settings, data);

         makeCall('POST', '/data/picture', postObj, function (response) {
             if (isFunction(callback))
                 callback();
         });
    };

    this.sendStatistics = function (data, callback) {
        var settings = {
                level: '',
                clicks:'',
                won: 0,
                time_taken: 0,
                category: ''
            },
            endpoint = '/data/' + storage.get('session-token'),
            postObj = setupPostObj(settings, data);

        makeCall('PUT', endpoint, postObj, function (response) {
            if (isFunction(callback))
                callback();
        });
    };

    this.createSession = function (data, callback) {
        var settings = {
            city: '',
            state: '',
            zip: '',
            country: '',
            difficulty: ''
        },
        postObj = setupPostObj(settings, data);

        makeCall('POST', '/data', postObj, function (response) {
            storage.set('session-token', response.session);

            if (isFunction(callback))
                callback();
        });
    };

}]);
