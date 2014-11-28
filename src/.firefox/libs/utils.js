function bind(obj, method) {
  var args = Array.prototype.splice.call(arguments, 2, arguments.length);
  return function() {
    return method.apply(obj, args.concat(Array.prototype.slice.call(arguments)));
  };
}

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

function callUnsafeJSObject(wrappedContentWin, eventCallback) {
  if (isWindowClosed(wrappedContentWin)) return; /* The window is closed and therefore it should not be called! */
  
  let args = Array.prototype.slice.call(arguments, 2);
  new XPCNativeWrapper(wrappedContentWin, "setTimeout()").setTimeout(function(){ eventCallback.apply(null, args) }, 0);
}

function setTimeout(callback, delay) {
  let timer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);
  timer.initWithCallback({ notify: callback }, delay, Ci.nsITimer.TYPE_ONE_SHOT);
  return timer;
}

function getHiddenWindow() {
  return Cc['@mozilla.org/appshell/appShellService;1'].getService(Ci.nsIAppShellService).hiddenDOMWindow;
}

function pseudoRandom() {
  return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}

function guid() {
  return pseudoRandom() + pseudoRandom() + '-' + pseudoRandom() + '-' + pseudoRandom() + '-' + pseudoRandom() + '-' + pseudoRandom() + pseudoRandom() + pseudoRandom();
}

exports["guid"] = guid;
exports["bind"] = bind;
exports["isWindowClosed"] = isWindowClosed;
exports["runAsync"] = runAsync;
exports["getFirebugConsole"] = getFirebugConsole;
exports["callUnsafeJSObject"] = callUnsafeJSObject;
exports["setTimeout"] = setTimeout;
exports["getHiddenWindow"] = getHiddenWindow;