/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
window.DOMinator = (function() {
  'use strict';

  function flatten(array) {
    return [].reduce.call(array, function(prevValue, currValue) {
      if ('length' in currValue)
        return prevValue.concat([].slice.call(currValue, 0));

      return prevValue.push(currValue);
    }, []);
  }

  function isString(itemToCheck) {
    return '[object String]' === Object.prototype.toString.apply(itemToCheck);
  }

  function isArray(itemToCheck) {
    return '[object Array]' === Object.prototype.toString.apply(itemToCheck);
  }

  function getElements(selector) {
      if (! selector) return [];

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

      // already an array, just return the array.
      if (isArray(selector))
          return selector;

      // an array-like object, conver to an array.
      if ('length' in selector)
          return [].slice.call(selector, 0);

      return [ selector ];
  }

  function isValBased(target) {
      var elName = target.nodeName.toLowerCase();
      return elName === 'input' || elName === 'textarea';
  }

  function createChain(selector) {
    var chained = Object.create(Chained);
    chained.init(selector);
    return chained;
  }

  var Chained = {
    init: function(selector) {
      var els = getElements(selector);
      els.forEach(function(item, index) {
        this[index] = item;
      }, this);
      this.length = els.length;
      return this;
    },

    nth: function(index) {
      return this[index];
    },

    children: function() {
      return createChain(flatten(this.map(function(element) {
        return element.childNodes;
      })));
    },

    nthChild: function(index) {
      return this.children()[index];
    },

    find: function(selector) {
      return createChain(flatten(this.map(function(element) {
        return element.querySelectorAll(selector);
      })));
    },

    findIncludeRoot: function(selector) {
      var els = [].slice.call(this.find(selector), 0);

      this.forEach(function(element) {
        if (createChain(element).is(selector)) {
          // TODO, this is going to put elements on the front in reverse order.
          els.unshift(element);
        }
      });

      return createChain(els);
    },

    is: function(type) {
      var haystack = createChain(type);

      var needle = this[0];
      if (! needle) return false;

      return haystack.indexOf(needle) > -1;
    },

    closest: function(selector) {
      var target = this[0];

      while (target) {
        var chained = createChain(target);
        if (chained.is(selector)) return chained;
        target = target.parentNode;
      }
    },

    remove: function() {
      this.forEach(function(element) {
        element.parentNode.removeChild(element);
      });

      return this;
    },

    bindEvent: function(eventName, callback, bubble) {
      this.forEach(function(element) {
        element.addEventListener(eventName, callback, bubble);
      });

      return this;
    },

    unbindEvent: function(eventName, callback, bubble) {
      this.forEach(function(element) {
        element.removeEventListener(eventName, callback, bubble);
      });

      return this;
    },

    fireEvent: function(type) {
      this.forEach(function(element) {
          var event = document.createEvent('CustomEvent');
          event.initCustomEvent(type, true, true, undefined);
          element.dispatchEvent(event);
      });

      return this;
    },

    inner: function(value) {
      if (arguments.length === 0) {
        var target = this.nth(0);
        if (! target) return;

        if(isValBased(target)) {
            return target.value;
        }

        return target.innerHTML;
      }

      this.forEach(function(element) {
        if(isValBased(element)) {
          element.value = value;
        }
        else {
          element.innerHTML = value;
        }
      });

      return this;
    },

    empty: function() {
      this.forEach(function(element) {
        element.innerHTML = '';
      });
    },

    attr: function(attrName, value) {
      if (arguments.length === 1) {
        var element = this.nth(0);
        if (! element) return;
        return element.getAttribute(attrName);
      }

      this.forEach(function(element) {
        element.setAttribute(attrName, value);
      });

      return this;
    },

    hasAttr: function(attrName) {
      var element = this.nth(0);
      if (! element) return false;
      return !! element.hasAttribute(attrName);
    },

    removeAttr: function(attrName) {
      this.forEach(function(element) {
        element.removeAttribute(attrName);
      });

      return this;
    },

    addClass: function(className) {
      this.forEach(function(element) {
        element.classList.add(className);
      });

      return this;
    },

    removeClass: function(className) {
      this.forEach(function(element) {
        element.classList.remove(className);
      });

      return this;
    },

    hasClass: function(className) {
      var element = this.nth(0);
      if (! element) return false;
      return element.classList.contains(className);
    },

    append: function(elementToAppend) {
      this.forEach(function(parent) {
        createChain(elementToAppend).forEach(function(element) {
          parent.appendChild(element);
        });
      });

      return this;
    },

    appendTo: function(elementToAppendTo) {
      var parentNode = createChain(elementToAppendTo).nth(0);
      if (! parentNode) return;

      this.forEach(function(element) {
        parentNode.appendChild(element);
      });

      return this;
    },

    insertAfter: function(elementToInsertAfter) {
      var insertAfter = createChain(elementToInsertAfter).nth(0);
      if (! insertAfter) return;

      var insertBefore = insertAfter.nextChild || null;
      var parentNode = insertAfter.parentNode;

      this.forEach(function(element) {
        parentNode.insertBefore(element, insertBefore);
      });

      return this;
    },

    insertBefore: function(elementToInsertBefore) {
      var insertBefore = createChain(elementToInsertBefore).nth(0);
      if (! insertBefore) return;

      var parentNode = insertBefore.parentNode;

      this.forEach(function(element) {
        parentNode.insertBefore(element, insertBefore);
      });

      return this;
    },

    insertAsNthChild: function(parent, index) {
      var nthChild = createChain(parent).nthChild(index);
      if (! nthChild) return;

      this.forEach(function(element) {
        nthChild.parentElement.insertBefore(element, nthChild);
      });

      return this;
    },

    focus: function() {
      var target = this.nth(0);
      if (! target) return;
      target.focus();

      return this;
    },

    show: function() {
      return this.style('display', 'block');
    },

    hide: function() {
      return this.style('display', 'none');
    },

    style: function(name, value) {
      this.forEach(function(element) {
        element.style[name] = value;
      });

      return this;
    }
  };

  [
    'map',
    'indexOf',
    'forEach'
  ].forEach(function(key) {
    Chained[key] = function() {
      return [][key].apply(this, arguments);
    };
  });

  return createChain;

}());

