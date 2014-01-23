const EXPORTED_SYMBOLS = ['runAsync'];

const Cc = Components.classes,
      Ci = Components.interfaces,
      Cu = Components.utils;

function runAsync(callback) {
  let params = Array.prototype.slice.call(arguments, 2);
  let runnable = {
    run: function() {
      callback.apply(thisPtr, params);
    }
  };
  Cc['@mozilla.org/thread-manager;1'].getService(Ci.nsIThreadManager).currentThread.dispatch(runnable, Ci.nsIEventTarget.DISPATCH_NORMAL);
}
