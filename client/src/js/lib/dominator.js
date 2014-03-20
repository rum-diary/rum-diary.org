/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = (function() {
  /* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

  'use strict';

  /*global document*/

  var DOMinator = {
    /**
     * Fill the DOMinator object with the selector
     */
    fill: function(selector) {
      var els = getElements(selector);

      els.forEach(function(item, index) {
        this[index] = item;
      }, this);
      this.length = els.length;

      return this;
    },

    /**
     * Get the nth object in the set
     */
    nth: function(index) {
      return this[index];
    },

    /**
     * Get all the children of all the elements in the set
     */
    children: function() {
      return toDOMinator(flatten(this.toArray().map(function(element) {
        return element.childNodes;
      })));
    },

    /**
     * Get the nth child of all the children of all the elements in the set
     */
    nthChild: function(index) {
      return this.children()[index];
    },

    /**
     * Find descendent elements
     */
    find: function(selector) {
      return toDOMinator(flatten(this.toArray().map(function(element) {
        return element.querySelectorAll(selector);
      })));
    },

    /**
     * Find descendent elements and include the root if it matches the selector
     */
    findIncludeRoot: function(selector) {
      var els = [].slice.call(this.find(selector), 0);

      this.forEach(function(element) {
        if (toDOMinator(element).is(selector)) {
          // TODO, this is going to put elements on the front in reverse order.
          els.unshift(element);
        }
      });

      return toDOMinator(els);
    },

    /**
     * Check if the first element of the set matches the type
     */
    is: function(type) {
      if (isEmpty(this)) return false;

      var haystack = toDOMinator(type).toArray();
      return haystack.indexOf(this[0]) > -1;
    },

    /**
     * Find the closest ancestor of the first element of the set
     * that matches the selector
     */
    closest: function(selector) {
      var target = this[0];

      while (target) {
        var chained = toDOMinator(target);
        if (chained.is(selector)) return chained;
        target = target.parentNode;
      }
    },

    /**
     * Remove the set of elements from the DOM
     */
    remove: function() {
      return this.forEach(function(element) {
        element.parentNode.removeChild(element);
      });
    },

    /**
     * Add a DOM event handler to the set of elements
     */
    bindEvent: function(eventName, callback, bubble) {
      return this.forEach(function(element) {
        element.addEventListener(eventName, callback, bubble);
      });
    },

    /**
     * Remove a DOM event handler from the set of elements
     */
    unbindEvent: function(eventName, callback, bubble) {
      return this.forEach(function(element) {
        element.removeEventListener(eventName, callback, bubble);
      });
    },

    /**
     * Fire a synthetic event on the set of elements
     */
    fireEvent: function(type) {
      return this.forEach(function(element) {
        var event = document.createEvent('CustomEvent');
        event.initCustomEvent(type, true, true, undefined);
        element.dispatchEvent(event);
      });
    },

    /**
     * Get/Set the innerHTML or value of an element.
     */
    inner: function(value) {
      if (arguments.length === 0) {
        var target = this[0];
        if (! target) return;

        if(isValBased(target)) {
            return target.value;
        }

        return target.innerHTML;
      }

      return this.forEach(function(element) {
        if(isValBased(element)) {
          element.value = value;
        }
        else {
          element.innerHTML = value;
        }
      });
    },

    /**
     * Remove all children from the set of elements
     */
    empty: function() {
      return this.forEach(function(element) {
        toDOMinator(element).inner('');
      });
    },

    /**
     * Get/Set an attribute on the set of elements
     */
    attr: function(attrName, value) {
      if (arguments.length === 1) {
        var element = this[0];
        if (! element) return;
        return element.getAttribute(attrName);
      }

      return this.forEach(function(element) {
        element.setAttribute(attrName, value);
      });
    },

    /**
     * Check if the first element in the set has an attribute
     */
    hasAttr: function(attrName) {
      if (isEmpty(this)) return false;
      return !! this[0].hasAttribute(attrName);
    },

    /**
     * Remove the attribute from all elements in the set
     */
    removeAttr: function(attrName) {
      return this.forEach(function(element) {
        element.removeAttribute(attrName);
      });
    },

    /**
     * Add a class to all elements in the set
     */
    addClass: function(className) {
      return this.forEach(function(element) {
        element.classList.add(className);
      });
    },

    /**
     * Remove a class from all elements in the set
     */
    removeClass: function(className) {
      return this.forEach(function(element) {
        element.classList.remove(className);
      });
    },

    /**
     * Check if the first element in the set has a class name
     */
    hasClass: function(className) {
      if (isEmpty(this)) return false;
      return this[0].classList.contains(className);
    },

    /**
     * Iterate over the elements
     */
    forEach: function(callback, context) {
      [].forEach.call(this, callback, context);
      return this;
    },

    /**
     * Run map over the set of elements.
     */
    map: function(callback, context) {
      return [].map.call(this, callback, context);
    },

    /**
     * Append an element to all elements in the set
     */
    append: function(elementToAppend) {
      return this.forEach(function(parent) {
        toDOMinator(elementToAppend).forEach(function(element) {
          parent.appendChild(element);
        });
      });
    },

    /**
     * Append the current set of elements to another element
     */
    appendTo: function(elementToAppendTo) {
      var parentNode = toDOMinator(elementToAppendTo)[0];
      if (! parentNode) return;

      return this.forEach(function(element) {
        parentNode.appendChild(element);
      });
    },

    /**
     * Insert the current set of elements after another element
     */
    insertAfter: function(elementToInsertAfter) {
      var insertAfter = toDOMinator(elementToInsertAfter)[0];
      if (! insertAfter) return;

      var insertBefore = insertAfter.nextChild || null;
      var parentNode = insertAfter.parentNode;

      return this.forEach(function(element) {
        parentNode.insertBefore(element, insertBefore);
      });
    },

    /**
     * Insert the current set of elements before another element
     */
    insertBefore: function(elementToInsertBefore) {
      var insertBefore = toDOMinator(elementToInsertBefore)[0];
      if (! insertBefore) return;

      var parentNode = insertBefore.parentNode;

      return this.forEach(function(element) {
        parentNode.insertBefore(element, insertBefore);
      });
    },

    /**
     * Insert the current set of elements as the Nth child of another element
     */
    insertAsNthChild: function(parent, index) {
      var nthChild = toDOMinator(parent).nthChild(index);
      if (! nthChild) return;

      return this.forEach(function(element) {
        nthChild.parentElement.insertBefore(element, nthChild);
      });
    },

    /**
     * Focus the first element in the set
     */
    focus: function() {
      if (isEmpty(this)) return;

      this[0].focus();
      return this;
    },

    /**
     * Show all elements in the set by setting 'display: block'
     */
    show: function() {
      return this.style('display', 'block');
    },

    /**
     * Hide all elements in the set by setting 'display: none'
     */
    hide: function() {
      return this.style('display', 'none');
    },

    /**
     * Set a style on all elements in the set
     */
    style: function(name, value) {
      return this.forEach(function(element) {
        element.style[name] = value;
      });
    },

    /**
     * Convert the set to an Array
     */
    toArray: function() {
      return [].slice.call(this, 0);
    }
  };

  function flatten(array) {
    return [].reduce.call(array, function(prevValue, currValue) {
      return prevValue.concat([].slice.call(currValue, 0));
    }, []);
  }

  function isString(itemToCheck) {
    return '[object String]' === Object.prototype.toString.apply(itemToCheck);
  }

  function getElements(selector) {
    if ( ! selector) return [];

    if (isString(selector)) {
      selector = selector.trim();
      if (selector[0] === "<") {
        // HTML was specified! Create the elements
        var element = document.createElement('div');
        element.innerHTML = selector;
        return getElements(element.childNodes);
      }

      // Just a normal selector
      return getElements(document.querySelectorAll(selector));
    }

    // an array or array-like object, make a copy or convert to an array.
    if ('length' in selector)
        return [].slice.call(selector, 0);

    return [ selector ];
  }

  function isValBased(target) {
    var elName = target.nodeName.toLowerCase();
    return elName === 'input' || elName === 'textarea';
  }

  function isEmpty(dominator) {
    return !dominator.length;
  }

  function toDOMinator(selector) {
    var dom = Object.create(DOMinator);
    dom.fill(selector);
    return dom;
  }

  return toDOMinator;



}());

