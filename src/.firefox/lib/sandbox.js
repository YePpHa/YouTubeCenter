Cu.import("resource://gre/modules/Services.jsm");

var {getChromeWinForContentWin} = require("getChromeWinForContentWin");
var {getFirebugConsole, bind, runAsync, console} = require("utils");
var {storage} = require("storage");
var {session} = require("session");
var {Request} = require("request");

function Sandbox(whitelist, blacklist) {
  this.whitelist = whitelist;
  this.blacklist = blacklist;
}

Sandbox.prototype.isRunnable = function(url) {
  for (var i = 0; i < this.blacklist.length; i++) {
    if (this.blacklist[i].test(url + "/")) {
      return false;
    }
  }
  for (var i = 0; i < this.whitelist.length; i++) {
    if (this.whitelist[i].test(url + "/")) {
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
    
    Cu.evalInSandbox(content, sandbox, "1.8", filename, 0);
  }
}

Sandbox.prototype.createSandbox = function(wrappedContentWin, chromeWin, firebugConsole) {
  function onWindowUnloadAsync() {
    wrappedContentWin.removeEventListener("unload", onWindowUnloadAsync, true);
    delete wrappedContentWin;
    if (runAsync) {
      runAsync(null, unloadCurrentSandbox);
    }
  }
  function onWindowUnload() {
    unloadCurrentSandbox();
    
    wrappedContentWin.removeEventListener("unload", onWindowUnloadAsync, true);
    delete wrappedContentWin;
  }
  function unloadCurrentSandbox() {
    console.log("[Firefox:Sandbox] Nuking sandbox.");
    if ("nukeSandbox" in Cu) {
      // Bug 775067: From FF17 we can kill all CCW from a given sandbox
      Cu.nukeSandbox(sandbox);
    }
    delete sandbox;
  }
  var sandbox = new Cu.Sandbox(
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
  
  wrappedContentWin.addEventListener("unload", onWindowUnloadAsync, true);
  unload(onWindowUnload);
  
  return sandbox;
}

exports["Sandbox"] = Sandbox;