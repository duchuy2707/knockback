/*
  knockback.js 2.0.0-alpha.1
  Copyright (c)  2011-2016 Kevin Malakoff.
  License: MIT (http://www.opensource.org/licenses/mit-license.php)
  Source: https://github.com/kmalakoff/knockback
  Dependencies: Knockout.js, Backbone.js, and Underscore.js (or LoDash.js).
  Optional dependencies: Backbone.ModelRef.js and BackboneORM.
*/

import _ from 'underscore';
import ko from 'knockout';

import kb from '@knockback/core';

export const toFormattedString = (format, ...args) => {
  let result = format.slice();
  _.each(args, (arg, index) => {
    let value = ko.utils.unwrapObservable(arg);
    if (_.isUndefined(value) || _.isNull(value)) value = '';

    let parameter_index = format.indexOf(`{${index}}`);
    while (~parameter_index) {
      result = result.replace(`{${index}}`, value);
      parameter_index = format.indexOf(`{${index}}`, parameter_index + 1);
    }
  });
  return result;
};

export const parseFormattedString = (string, format) => {
  let regex_string = format.slice(); let index = 0; let parameter_count = 0; const positions = {};
  while (regex_string.search(`\\{${index}\\}`) >= 0) {
    // store the positions of the replacements
    let parameter_index = format.indexOf(`{${index}}`);
    while (~parameter_index) {
      regex_string = regex_string.replace(`{${index}}`, '(.*)');
      positions[parameter_index] = index; parameter_count++;
      parameter_index = format.indexOf(`{${index}}`, parameter_index + 1);
    }
    index++;
  }
  let count = index;

  const regex = new RegExp(regex_string);
  const matches = regex.exec(string);
  if (matches) { matches.shift(); }
  // return fake empty data
  if (!matches || (matches.length !== parameter_count)) {
    const result = [];
    while (count-- > 0) { result.push(''); }
    return result;
  }

  // sort the matches since the parameters could be requested unordered
  const sorted_positions = _.sortBy(_.keys(positions), parameter_index => +parameter_index);
  const format_indices_to_matched_indices = {};
  _.each(sorted_positions, (parameter_index, match_index) => {
    parameter_index = sorted_positions[match_index];
    index = positions[parameter_index];
    if (!(index in format_indices_to_matched_indices)) {
      format_indices_to_matched_indices[index] = match_index;
    }
  });

  const results = []; index = 0;
  while (index < count) {
    results.push(matches[format_indices_to_matched_indices[index]]);
    index++;
  }
  return results;
};

// Handles two-way formatted string convertions and will reformat a string when any argument changes. The format string can also be an observable.
//
// @example change the formatted name whenever a model's name attribute changes
//   var observable = kb.formattedObservable("{0} and {1}", arg1, arg2);
export default class FormattedObservable {
  // Used to create a new kb.FormattedObservable.
  //
  // @param [String|ko.observable] format the format string.
  // Format: `"{0} and {1}"` where `{0}` and `{1}` would be synchronized with the arguments (eg. "Bob and Carol" where `{0}` is Bob and `{1}` is Carol)
  // @param [Array] args arguments to be passed to the kb.LocaleManager's get() method
  // @return [ko.observable] the constructor does not return 'this' but a ko.observable
  // @note the constructor does not return 'this' but a ko.observable
  constructor(format, ...args) {
    // being called by the factory function
    const observable_args = _.isArray(args[0]) ? args[0] : args;
    const observable = kb.utils.wrappedObservable(this, ko.computed({
      read() {
        args = [ko.utils.unwrapObservable(format)];
        _.each(observable_args, arg => args.push(ko.utils.unwrapObservable(arg)));
        return toFormattedString.apply(null, args);
      },
      write(value) {
        const matches = parseFormattedString(value, ko.utils.unwrapObservable(format));
        const max_count = Math.min(observable_args.length, matches.length); let index = 0;
        while (index < max_count) {
          observable_args[index](matches[index]);
          index++;
        }
      },
    }));

    return observable;
  }

  // Required clean up function to break cycles, release view models, etc.
  // Can be called directly, via kb.release(object) or as a consequence of ko.releaseNode(element).
  destroy() { return kb.utils.wrappedDestroy(this); }
}

export const formattedObservable = (...args) => new FormattedObservable(...args);