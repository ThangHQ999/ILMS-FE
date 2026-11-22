// 1. Strip browser extension attributes that cause React hydration mismatches
try {
  var cleanAttr = function(el) {
    if (!el || !el.attributes) return;
    var attrs = el.attributes;
    for (var i = attrs.length - 1; i >= 0; i--) {
      var n = attrs[i].name;
      if (
        n === 'bis_skin_checked' ||
        n === 'bis_register' ||
        (n && n.indexOf('__processed_') === 0) ||
        n === 'data-gramm' ||
        n === 'data-lt-installed'
      ) {
        el.removeAttribute(n);
      }
    }
  };

  var cleanSubtree = function(root) {
    if (!root) return;
    cleanAttr(root);
    var all = root.querySelectorAll ? root.querySelectorAll('*') : [];
    for (var i = 0; i < all.length; i++) {
      cleanAttr(all[i]);
    }
  };

  cleanSubtree(document.documentElement);

  if (typeof MutationObserver !== 'undefined') {
    var extObserver = new MutationObserver(function(mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var m = mutations[i];
        if (m.type === 'attributes') {
          var name = m.attributeName;
          if (
            name === 'bis_skin_checked' ||
            name === 'bis_register' ||
            (name && name.indexOf('__processed_') === 0)
          ) {
            m.target.removeAttribute(name);
          }
        } else if (m.type === 'childList') {
          for (var j = 0; j < m.addedNodes.length; j++) {
            cleanSubtree(m.addedNodes[j]);
          }
        }
      }
    });

    extObserver.observe(document.documentElement, {
      attributes: true,
      childList: true,
      subtree: true,
    });
  }

  // Suppress browser extension hydration warnings & third-party extension crashes in console
  var origError = console.error;
  console.error = function() {
    var args = Array.prototype.slice.call(arguments);
    var first = args[0] ? String(args[0]) : '';
    if (
      first.indexOf('bis_skin_checked') !== -1 ||
      first.indexOf('bis_register') !== -1 ||
      first.indexOf('__processed_') !== -1 ||
      first.indexOf('chrome-extension://') !== -1 ||
      first.indexOf('moz-extension://') !== -1 ||
      first.indexOf('eppiocemhmnlbhjplcgkofciiegomcon') !== -1 ||
      first.indexOf('M_ID') !== -1
    ) {
      return;
    }
    return origError.apply(console, args);
  };

  // Suppress unhandled runtime errors thrown by browser extensions (e.g. Urban VPN executors/200.js)
  window.addEventListener(
    'error',
    function(event) {
      var fn = event.filename || '';
      var stack = event.error && event.error.stack ? String(event.error.stack) : '';
      if (
        fn.indexOf('chrome-extension://') !== -1 ||
        fn.indexOf('moz-extension://') !== -1 ||
        stack.indexOf('chrome-extension://') !== -1 ||
        stack.indexOf('moz-extension://') !== -1 ||
        stack.indexOf('eppiocemhmnlbhjplcgkofciiegomcon') !== -1 ||
        stack.indexOf('M_ID') !== -1
      ) {
        event.stopImmediatePropagation();
        event.preventDefault();
        return true;
      }
    },
    true
  );

  window.addEventListener(
    'unhandledrejection',
    function(event) {
      var stack = '';
      if (event.reason) {
        stack = event.reason.stack ? String(event.reason.stack) : String(event.reason);
      }
      if (
        stack.indexOf('chrome-extension://') !== -1 ||
        stack.indexOf('moz-extension://') !== -1 ||
        stack.indexOf('eppiocemhmnlbhjplcgkofciiegomcon') !== -1 ||
        stack.indexOf('M_ID') !== -1
      ) {
        event.stopImmediatePropagation();
        event.preventDefault();
      }
    },
    true
  );
} catch (e) {}

// 2. Theme & Font Token Initialization
try {
  var c = localStorage.getItem('ilms_color_tokens');
  if (c) {
    var p = JSON.parse(c);
    var r = document.documentElement;
    if (p.primary) r.style.setProperty('--color-primary', p.primary);
    if (p.secondary) r.style.setProperty('--color-secondary', p.secondary);
    if (p.tertiary) r.style.setProperty('--color-tertiary', p.tertiary);
    if (p.neutral) r.style.setProperty('--color-neutral', p.neutral);
  }
  var f = localStorage.getItem('ilms_font_family');
  if (!f || f === 'Google Sans') {
    f = 'Outfit';
    localStorage.setItem('ilms_font_family', 'Outfit');
  }
  var fontMap = {
    'Outfit': "var(--font-outfit), var(--font-plus-jakarta-sans), sans-serif",
    'Plus Jakarta Sans': "var(--font-plus-jakarta-sans, 'Plus Jakarta Sans'), sans-serif",
    'Inter': "var(--font-inter, 'Inter'), sans-serif",
    'Montserrat': "var(--font-montserrat, 'Montserrat'), sans-serif",
    'Be Vietnam Pro': "var(--font-be-vietnam-pro, 'Be Vietnam Pro'), sans-serif",
  };
  if (f && fontMap[f]) {
    document.documentElement.style.setProperty('--font-sans', fontMap[f]);
  }
} catch (e) {}
