var store = require('store');

module.exports = (function () {

    var callbacks = [];

    function init () {
        var geo = store.get('geoData');
        if ( window.data.geoData.length == 0 && geo == null) {

            geolocator.locate(function (location) {
                window.data.geoData = location;
                store.set('geoData', window.data.geoData);
                runCallbacks();
            }, function (error) {
                // console.log(error);
            }, true);

        } else {
            window.data.geoData = geo;
            runCallbacks();
        }
    }

    function runCallbacks () {
        if (callbacks.length > 0)
            return;

        for (var i = 0; i < callbacks.length; i++) {
            var call = callbacks[i];
            call(window.data.geoData);
        }
    }

    init();

    return {
        attachCallback: function (func) {
            if ($.isFunction(func)) {
                callbacks.push(func);
                return true;
            }

            return false;
        }
    }

})();
