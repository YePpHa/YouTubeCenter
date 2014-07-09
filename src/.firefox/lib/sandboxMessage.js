var {console, isWindowClosed} = require("utils");

function callUnsafeFunction(wrappedContentWin, id) {
  if (isWindowClosed(wrappedContentWin)) return; /* The window is closed and therefore it should not be called! */
  let xpc = new XPCNativeWrapper(wrappedContentWin, "onFirefoxEvent()");
  xpc.onFirefoxEvent.apply(null, Array.prototype.slice.call(arguments, 1));
}

exports["callUnsafeFunction"] = callUnsafeFunction;