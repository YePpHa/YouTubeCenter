var EXPORTED_SYMBOLS = ['Sandbox'];

const Cc = Components.classes,
      Ci = Components.interfaces,
      Cu = Components.utils;

Cu.import("resource://ytcenter/modules/third-party/getChromeWinForContentWin.js");
Cu.import("resource://ytcenter/modules/third-party/firebug.js");
Cu.import("resource://ytcenter/modules/request.js");
Cu.import("resource://ytcenter/modules/storage2.js");
Cu.import("resource://ytcenter/modules/session.js");
Cu.import("resource://ytcenter/modules/utils/bind.js");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");

function Sandbox(urls) {
  this.sandbox_storage = new Storage();
  this.session_storage = new Session();
  this.regexUrls = urls;
}

Sandbox.prototype.isRunnable = function(url) {
  for (var i = 0; i < this.regexUrls.length; i++) {
    if (this.regexUrls[i].test(url + "/")) {
      return true;
    }
  }
  return false;
}

Sandbox.prototype.loadScript = function(url, wrappedContentWin, doc) {
  if (this.isRunnable(doc.location.href)) {
    var chromeWindow = getChromeWinForContentWin(wrappedContentWin);
    var sb = this.createSandbox(wrappedContentWin, chromeWindow, getFirebugConsole(wrappedContentWin, chromeWindow));
    Services.scriptloader.loadSubScript(url, sb, "UTF-8");
  }
}

Sandbox.prototype.createSandbox = function(wrappedContentWin, chromeWin, firebugConsole) {
  var sb = new Cu.Sandbox(
    wrappedContentWin, {
      "sandboxName": "YouTube Center",
      "sandboxPrototype": wrappedContentWin,
      "wantXrays": true,
    }
  );
  
  sb.unsafeWindow = wrappedContentWin.wrappedJSObject;
  if (firebugConsole) sb.console = firebugConsole;
  
  sb.request = bind(new Request(wrappedContentWin, chromeWin), "sendRequest");
  
  sb.storage_setValue = bind(this.sandbox_storage, "setValue");
  sb.storage_getValue = bind(this.sandbox_storage, "getValue");
  sb.storage_listValues = bind(this.sandbox_storage, "listValues");
  sb.storage_exists = bind(this.sandbox_storage, "exists");
  sb.storage_remove = bind(this.sandbox_storage, "remove");
  sb.storage_addEventListener = bind(this.sandbox_storage, "addEventListener", wrappedContentWin);
  sb.storage_removeEventListener = bind(this.sandbox_storage, "removeEventListener", wrappedContentWin);
  
  sb.session_setValue = bind(this.session_storage, "setValue");
  sb.session_getValue = bind(this.session_storage, "getValue");
  sb.session_listValues = bind(this.session_storage, "listValues");
  sb.session_exists = bind(this.session_storage, "exists");
  sb.session_remove = bind(this.session_storage, "remove");
  sb.session_addEventListener = bind(this.session_storage, "addEventListener", wrappedContentWin);
  sb.session_removeEventListener = bind(this.session_storage, "removeEventListener", wrappedContentWin);
  
  return sb;
}