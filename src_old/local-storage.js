'use strict';
/* jshint node: true */

var LocalStorage = {
    getItem: function(key, optionalCallback) {
        if (!this.supportsLocalStorage()) {
            return null;
        }

        var callback = function(data) {
            data = typeof data !== 'undefined' ? data : null;

            return typeof optionalCallback == 'function' ? optionalCallback(data) : data;
        };

        var value = localStorage.getItem(key);

        if (value !== null) {
            value = JSON.parse(value);

            if (value.hasOwnProperty('__expiry')) {
                var expiry = value.__expiry;
                var now = Date.now();

                if (now >= expiry) {
                    this.removeItem(key);

                    return callback();
                } else {
                    // Return the data object only.
                    return callback(value.__data);
                }
            } else {
                // Value doesn't have expiry data, just send it wholesale.
                return callback(value);
            }
        } else {
            return callback();
        }
    },

    setItem: function (key, value, expiry) {
        if (!this.supportsLocalStorage() || typeof value === 'undefined' || key === null || value === null) {
            return false;
        }

        if (typeof expiry === 'number') {
            value = {
            __data: value,
            __expiry: Date.now() + (parseInt(expiry) * 1000)
            };
        }

        try {
            localStorage.setItem(key, JSON.stringify(value));

            return true;
        } catch (e) {
            console.log('Unable to store ' + key + ' in localStorage due to ' + e.name);

            return false;
        }
    },

    removeItem: function (key) {
        if (this.supportsLocalStorage()) {
            localStorage.removeItem(key);
        }
    },

    clear: function () {
        if (this.supportsLocalStorage()) {
            localStorage.clear();
        }
    },

    supportsLocalStorage: function () {
        try {
            localStorage.setItem('_', '_');
            localStorage.removeItem('_');

            return true;
        } catch (e) {
            return false;
        }
    }
}

module.exports = LocalStorage;
