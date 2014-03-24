Cu.import("resource://gre/modules/Services.jsm");

var {getChromeWinForContentWin} = require("getChromeWinForContentWin");
var {getFirebugConsole, bind, bindCache} = require("utils");
var {storage} = require("storage");
var {session} = require("session");
var {Request} = require("request");

function Sandbox(urls) {
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

Sandbox.prototype.embedCheck = function(url) {
  let settings = storage.getValue("YouTubeCenterSettings");
  if (settings != null && !settings.embed_enabled && /^http(s)?:\/\/(((.*?)\.youtube\.com\/)|(youtube\.com\/))embed\//.test(url)) {
    return false;
  }
  
  return true;
}

Sandbox.prototype.loadScript = function(filename, content, wrappedContentWin, doc) {
  if (this.isRunnable(doc.location.href) && this.embedCheck(doc.location.href)) {
    let chromeWindow = getChromeWinForContentWin(wrappedContentWin);
    let firebugConsole = getFirebugConsole(wrappedContentWin, chromeWindow);
    let sandbox = this.createSandbox(wrappedContentWin, chromeWindow, firebugConsole);
    
    wrappedContentWin.addEventListener("unload", function(){ if (sandbox) { unloadSandbox(sandbox); sandbox = null; } }, false);
    unload(function(){ sandbox = null; });
    
    Cu.evalInSandbox(content, sandbox, "1.8", filename, 0);
    
    //Services.scriptloader.loadSubScript(url, sandbox, "UTF-8");
  }
}

Sandbox.prototype.createSandbox = function(wrappedContentWin, chromeWin, firebugConsole) {
  let sandbox = new Cu.Sandbox(
    wrappedContentWin, {
      "sandboxName": "YouTube Center",
      "sandboxPrototype": wrappedContentWin,
      "wantXrays": true,
    }
  );
  
  sandbox.unsafeWindow = wrappedContentWin.wrappedJSObject;
  if (firebugConsole) sandbox.console = firebugConsole;
  
  sandbox.request = bind(new Request(wrappedContentWin, chromeWin), "sendRequest");
  
  sandbox.storage_setValue = bind(storage, "setValue");
  sandbox.storage_getValue = bind(storage, "getValue");
  sandbox.storage_listValues = bind(storage, "listValues");
  sandbox.storage_exists = bind(storage, "exists");
  sandbox.storage_remove = bind(storage, "remove");
  sandbox.storage_addEventListener = bind(storage, "addEventListener", wrappedContentWin);
  sandbox.storage_removeEventListener = bind(storage, "removeEventListener", wrappedContentWin);
  
  sandbox.session_setValue = bind(session, "setValue");
  sandbox.session_getValue = bind(session, "getValue");
  sandbox.session_listValues = bind(session, "listValues");
  sandbox.session_exists = bind(session, "exists");
  sandbox.session_remove = bind(session, "remove");
  sandbox.session_addEventListener = bind(session, "addEventListener", wrappedContentWin);
  sandbox.session_removeEventListener = bind(session, "removeEventListener", wrappedContentWin);
  
  return sandbox;
}

exports["Sandbox"] = Sandbox;