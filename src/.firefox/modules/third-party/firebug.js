var EXPORTED_SYMBOLS = ['getFirebugConsole'];

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