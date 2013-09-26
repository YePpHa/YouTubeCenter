const EXPORTED_SYMBOLS = ['console'];
const conService = Components.classes['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService);

const console = {
  log: function(a, b, c, d, e){ conService.logStringMessage(a, b, c, d, e); },
  error: function(a, b, c, d, e){ Components.utils.reportError(a, b, c, d, e); }
};