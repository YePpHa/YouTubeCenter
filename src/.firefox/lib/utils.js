function bind(obj, method) {
  var args = Array.prototype.splice.call(arguments, 2, arguments.length);
  return function() {
    return method.apply(obj, args.concat(Array.prototype.slice.call(arguments)));
  };
}

const conService = Cc['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService);
const console = {
  log: function(a, b, c, d, e){ conService.logStringMessage(a, b, c, d, e); },
  error: function(a, b, c, d, e){ Cu.reportError(a, b, c, d, e); }
};

function isWindowClosed(aWin) {
  try {
    if (Cu.isDeadWrapper && Cu.isDeadWrapper(aWin)) {
      return true;
    }
    
    try {
      if (aWin.closed) return true;
    } catch (e) {
      return true;
    }
  } catch (e) {
    Cu.reportError(e);
    return true;
  }
  return false;
}

function runAsync(thisPtr, callback) {
  if (typeof callback !== "function") return;
  let params = Array.prototype.slice.call(arguments, 2);
  let runnable = {
    run: function() {
      callback.apply(thisPtr, params);
    }
  };
  Cc['@mozilla.org/thread-manager;1'].getService(Ci.nsIThreadManager).currentThread.dispatch(runnable, Ci.nsIEventTarget.DISPATCH_NORMAL);
}

function getFirebugConsole(wrappedContentWindow, chromeWindow) {
  try {
    return chromeWindow.Firebug
        && chromeWindow.Firebug.getConsoleByGlobal
        && chromeWindow.Firebug.getConsoleByGlobal(wrappedContentWindow)
        || null;
  } catch (e) {
    return null;
  }
}

function callUnsafeJSObject(wrappedContentWindow, callback) {
  let args = Array.prototype.slice.call(arguments, 2);
  
  if (isWindowClosed(wrappedContentWindow)) return; /* The window is closed and therefore it should not be called! */
  (new XPCNativeWrapper(wrappedContentWindow, "setTimeout")).setTimeout(function(){ callback.apply(null, args); }, 0);
}

function setTimeout(callback, delay) {
  let timer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);
  timer.initWithCallback({ notify: callback }, delay, Ci.nsITimer.TYPE_ONE_SHOT);
  return timer;
}

exports["bind"] = bind;
exports["console"] = console;
exports["isWindowClosed"] = isWindowClosed;
exports["runAsync"] = runAsync;
exports["getFirebugConsole"] = getFirebugConsole;
exports["callUnsafeJSObject"] = callUnsafeJSObject;
exports["setTimeout"] = setTimeout;