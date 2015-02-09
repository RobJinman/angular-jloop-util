/**
* General purpose functions and directives
*
* @module App
* @submodule jlUtil
* @requires jlScroll
*/
angular.module("jlUtil", [])

  /**
  * (SERVICE) A collection of useful functions that don't belong anywhere else
  *
  * @namespace jlUtil
  * @class util
  * @static
  * @param {Angular service} $log
  * @param {Angular service} jlWindow
  * @param {Angular service} $timeout
  * @param {Angular service} $document
  */
  .factory("util", [
  "$log", "jlWindow", "$timeout", "$document",
  function($log, jlWindow, $timeout, $document) {
    return {

      /**
      * @method element
      * @param {String} selector Fetch DOM element by selector
      * @return {DOM Element}
      */
      element: function(selector) {
        if (selector == "window") {
          return jlWindow;
        }

        var e = jQuery(selector);
        return e.length === 0 ? null : e;
      },

      /**
      * @method bind
      * @param {Object} context
      * @param {Function} fn
      * @return {Function}
      */
      bind: function(context, fn) {
        return function() {
          fn.apply(context, arguments);
        };
      },

      /**
      * @method onTransitionEnd
      * @param {DOM Element} e
      * @param {Function} fn
      */
      onTransitionEnd: function(e, fn) {
        e.on("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", fn);
      },

      /**
      * Limits the number of times func can be called to once
      * per delay milliseconds
      *
      * @method debounce
      * @param {Function} func
      * @param {Integer} delay Delay in milliseconds
      * @return {Function} A wrapper around the supplied function
      */
      debounce: function(func, delay) {
        var prev = 0;
        var promise = null;

        return function() {
          var t = (new Date()).getTime();
          var args = arguments;

          if (promise) {
            $timeout.cancel(promise);
            promise = null;
          }

          if (t - prev >= delay) {
            func.apply(undefined, args);
            prev = t;
          }
          else {
            var s = prev;

            promise = $timeout(function() {
              func.apply(undefined, args);
              prev = s + delay;
            }, delay - (t - prev));
          }
        };
      },

      /**
      * @method isWindow
      * @param {DOM Element} element jQuery or jqLite element
      * @return {Boolean}
      */
      isWindow: function(element) {
        var w = element.get(0);
        return $.isWindow(w);
      },

      /**
      * Returns element's position within (scrollable) (grand)parent container
      *
      * @method posWithinParent
      * @param {DOM Element} target
      * @param {DOM Element} container
      * @return {Integer x, Integer y} Coordinates in pixels
      */
      posWithinParent: function(target, container) {
        if (this.isWindow(container)) {
          return {
            x: target.offset().left,
            y: target.offset().top
          };
        }
        else {
          return {
            x: target.offset().left - container.offset().left + container.scrollLeft(),
            y: target.offset().top - container.offset().top + container.scrollTop()
          };
        }
      },

      /**
      * Returns element's position relative to another element
      *
      * @method relativePos
      * @param {DOM Element} target
      * @param {DOM Element} other
      * @return {Integer x, Integer y} Coordinates in pixels
      */
      relativePos: function(target, other) {
        if (this.isWindow(other)) {
          return {
            x: target.offset().left - other.scrollLeft(),
            y: target.offset().top - other.scrollTop()
          };
        }
        else {
          return {
            x: target.offset().left - other.offset().left,
            y: target.offset().top - other.offset().top
          };
        }
      },

      /**
      * @method shallowCopy
      * @param {Object} obj
      * @return {Object}
      */
      shallowCopy: function(obj) {
        var cpy = {};

        for (var prop in obj) {
          if (obj.hasOwnProperty(prop)) {
            cpy[prop] = obj[prop];
          }
        }

        return cpy;
      },

      /**
      * @method setYWithinParent
      * @param {DOM Element} element
      * @param {DOM Element} container
      * @param {Integer} value
      */
      setYWithinParent: function(element, container, value) {
        var y = parseInt(value);

        if (isNaN(y)) {
          $log.error("Error parsing int expression in util.setYWithinParent");
          return;
        }

        if (this.isWindow(container)) {
          element.offset({ top: y });
        }
        else {
          element.offset({ top: container.offset().top + y - container.scrollTop() });
        }
      },

      /**
      * @method setRelativeY
      * @param {DOM Element} element
      * @param {DOM Element} other
      * @param {Integer} value
      */
      setRelativeY: function(element, other, value) {
        y = parseInt(value);

        if (isNaN(y)) {
          $log.error("Error parsing int expression in util.setRelativeY");
          return;
        }

        if (this.isWindow(other)) {
          element.offset({ top: y + other.scrollTop() });
        }
        else {
          element.offset({ top: other.offset().top + y });
        }        
      }
    };
  }])

  /**
  * (SERVICE) Represents the browser window
  *
  * @namespace jlUtil
  * @class jlWindow
  * @static
  */
  .factory("jlWindow", ["$window", function($window) {
    return jQuery($window);
  }]);
