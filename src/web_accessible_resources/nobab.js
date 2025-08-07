/*******************************************************************************

    uBlock Origin - a browser extension to block requests.
    Copyright (C) 2019-present Raymond Hill

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see {http://www.gnu.org/licenses/}.

    Home: https://github.com/gorhill/uBlock
*/

(function() {
    'use strict';
    const signatures = [
        [ 'blockadblock' ],
        [ 'babasbm' ],
        [ /getItem\('babn'\)/ ],
        [
            'getElementById',
            'String.fromCharCode',
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
            'charAt',
            'DOMContentLoaded',
            'AdBlock',
            'addEventListener',
            'doScroll',
            'fromCharCode',
            '<<2|r>>4',
            'sessionStorage',
            'clientWidth',
            'localStorage',
            'Math',
            'random'
        ],
        // Additional common anti-adblock tokens
        [ 'FuckAdBlock', 'onDetected', 'onNotDetected', 'emitEvent', 'options' ],
        [ 'BlockAdBlock', 'check', 'clearEvent', 'emitEvent' ],
        [ 'SniffAdBlock', 'on', 'onDetected', 'setOption' ],
        [ 'adblock', 'bait', 'offsetHeight', 'offsetParent', 'getComputedStyle' ],
    ];

    const check = function(source) {
        for ( let i = 0; i < signatures.length; i++ ) {
            const tokens = signatures[i];
            let match = 0;
            for ( let j = 0; j < tokens.length; j++ ) {
                const token = tokens[j];
                const pos = token instanceof RegExp
                    ? source.search(token)
                    : source.indexOf(token);
                if ( pos !== -1 ) { match += 1; }
            }
            if ( (match / tokens.length) >= 0.8 ) { return true; }
        }
        return false;
    };

    const restorePageVisibility = function() {
        if ( document.body ) {
            document.body.style.removeProperty('visibility');
            document.body.style.removeProperty('opacity');
            document.body.style.removeProperty('pointer-events');
        }
        // Remove common anti-adblock overlays/messages when present
        let el = document.getElementById('babasbmsgx');
        if ( el && el.parentNode ) {
            el.parentNode.removeChild(el);
        }
    };

    // Intercept eval
    window.eval = new Proxy(window.eval, { // jshint ignore: line
        apply: function(target, thisArg, args) {
            const candidate = args[0];
            if ( typeof candidate !== 'string' || !check(candidate) ) {
                return target.apply(thisArg, args);
            }
            restorePageVisibility();
            // Swallow execution
            return undefined;
        }
    });

    // Intercept Function constructor and calls
    window.Function = new Proxy(window.Function, {
        apply: function(target, thisArg, args) {
            const body = args.length > 0 ? String(args[args.length - 1]) : '';
            if ( body && check(body) ) {
                restorePageVisibility();
                return function() {};
            }
            return target.apply(thisArg, args);
        },
        construct: function(target, args) {
            const body = args.length > 0 ? String(args[args.length - 1]) : '';
            if ( body && check(body) ) {
                restorePageVisibility();
                return function() {};
            }
            return new target(...args);
        }
    });

    // Intercept setTimeout used with string payloads
    window.setTimeout = new Proxy(window.setTimeout, {
        apply: function(target, thisArg, args) {
            const handler = args[0];
            if (
                typeof handler !== 'string' ||
                /.bab_elementid./.test(handler) === false
            ) {
                return target.apply(thisArg, args);
            }
            // Swallow timeout used by anti-adblock script
            restorePageVisibility();
            return 0;
        }
    });

    // Intercept setInterval used with string payloads
    window.setInterval = new Proxy(window.setInterval, {
        apply: function(target, thisArg, args) {
            const handler = args[0];
            if (
                typeof handler !== 'string' ||
                /.bab_elementid./.test(handler) === false
            ) {
                return target.apply(thisArg, args);
            }
            restorePageVisibility();
            return 0;
        }
    });
})();
