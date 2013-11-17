/*
  knockback-defaults.js 0.17.3
  (c) 2011-2013 Kevin Malakoff - http://kmalakoff.github.com/knockback/
  License: MIT (http://www.opensource.org/licenses/mit-license.php)
  Dependencies: Knockout.js, Backbone.js, and Underscore.js.
*/
(function() {
  return (function(factory) {
    // AMD
    if (typeof define === 'function' && define.amd) {
      return define(['underscore', 'backbone', 'knockout', 'knockback'], factory);
    }
    // CommonJS/NodeJS or No Loader
    else {
      return factory.call(this);
    }
  })(function() {// Generated by CoffeeScript 1.6.3
var kb, ko, _, _publishMethods, _unwrapObservable;

kb = !this.kb && (typeof require !== 'undefined') ? require('knockback') : this.kb;

_ = kb._;

ko = kb.ko;

this.Knockback = this.kb = kb;

if (typeof exports !== 'undefined') {
  module.exports = kb;
}

_unwrapObservable = ko.utils.unwrapObservable;

/*
  knockback_default_observable.js 0.17.3
  (c) 2011-2013 Kevin Malakoff.
  Knockback.DefaultObservable is freely distributable under the MIT license.
  See the following for full license details:
    https://github.com/kmalakoff/knockback/blob/master/LICENSE
*/


_publishMethods = kb._publishMethods;

kb.DefaultObservable = (function() {
  function DefaultObservable(target_observable, dv) {
    var observable,
      _this = this;
    this.dv = dv;
    observable = kb.utils.wrappedObservable(this, ko.dependentObservable({
      read: function() {
        var current_target;
        if ((current_target = _unwrapObservable(target_observable()))) {
          return current_target;
        } else {
          return _unwrapObservable(_this.dv);
        }
      },
      write: function(value) {
        return target_observable(value);
      }
    }));
    _publishMethods(observable, this, ['destroy', 'setToDefault']);
    return observable;
  }

  DefaultObservable.prototype.destroy = function() {
    return kb.utils.wrappedDestroy(this);
  };

  DefaultObservable.prototype.setToDefault = function() {
    return kb.utils.wrappedObservable(this)(this.dv);
  };

  return DefaultObservable;

})();

kb.defaultObservable = function(target, default_value) {
  return new kb.DefaultObservable(target, default_value);
};

/*
  knockback-extensions.js (knockback-defaults)
  (c) 2011-2013 Kevin Malakoff.
  Knockback.js is freely distributable under the MIT license.
  See the following for full license details:
    https://github.com/kmalakoff/knockback/blob/master/LICENSE
  Dependencies: Knockout.js, Backbone.js, and Underscore.js.
    Optional dependency: Backbone.ModelRef.js.
*/


kb.Observable.prototype.setToDefault = function() {
  var _ref;
  if ((_ref = this.__kb_value) != null) {
    if (typeof _ref.setToDefault === "function") {
      _ref.setToDefault();
    }
  }
};

kb.ViewModel.prototype.setToDefault = function() {
  var vm_key, _ref;
  for (vm_key in this.__kb.vm_keys) {
    if ((_ref = this[vm_key]) != null) {
      if (typeof _ref.setToDefault === "function") {
        _ref.setToDefault();
      }
    }
  }
};

kb.utils.setToDefault = function(obj) {
  var key, value;
  if (!obj) {
    return;
  }
  if (ko.isObservable(obj)) {
    if (typeof obj.setToDefault === "function") {
      obj.setToDefault();
    }
  } else if (_.isObject(obj)) {
    for (key in obj) {
      value = obj[key];
      if (value && (ko.isObservable(value) || (typeof value !== 'function')) && ((key[0] !== '_') || key.search('__kb'))) {
        this.setToDefault(value);
      }
    }
  }
  return obj;
};
; return kb;});
}).call(this);