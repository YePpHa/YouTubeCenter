const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

const {Services} = Cu.import("resource://gre/modules/Services.jsm", null);

var addonData = null;

var modules = {}; // The loaded modules (alike CommonJS)
var unloadListeners = []; // The unload listeners which will be called when the add-on needs to be unloaded (uninstall, reinstall, shutdown).

/* Add an unload listener to the queue
 * Optional: index - insert listener into queue at index
 */
function unload(listener, index) {
  if (typeof index === "number") {
    unloadListeners.splice(index, 0, listener);
  } else {
    unloadListeners.push(listener);
  }
}

/* Remove an unload listener from the queue */
function removeUnloadListener(listener) {
  for (let i = 0; i < unloadListeners.length; i++) {
    if (unloadListeners[i] === listener) {
      unloadListeners.splice(i, 1);
      i--;
    }
  }
}

function require(module) {
  if (!(module in modules)) {
    let principal = Cc["@mozilla.org/systemprincipal;1"].getService(Ci.nsIPrincipal);
    let url = "resource://ytcenter/libs/" + module + ".js";
    modules[module] = Cu.Sandbox(principal, {
      sandboxName: url,
      sandboxPrototype: {
        inFrameScript: false,
        require: require,
        exports: {},
        Cc: Cc,
        Ci: Ci,
        Cr: Cr,
        Cu: Cu,
        unload: unload,
        removeUnloadListener: removeUnloadListener
      },
      wantXrays: false
    });
    Services.scriptloader.loadSubScript(url, modules[module]);
  }
  return modules[module].exports;
}

/* Initialize YouTube Center */
function init() {
  var service = require("service/StartupService");
  
  (new service.StartupService()).init();
}

function createResourceAlias(aData, subAlias) {
  let resource = Services.io.getProtocolHandler("resource").QueryInterface(Ci.nsIResProtocolHandler);
  let alias = Services.io.newFileURI(aData.installPath);
  if (!aData.installPath.isDirectory())
    alias = Services.io.newURI("jar:" + alias.spec + "!/", null, null);
  resource.setSubstitution(subAlias, alias);
}

function removeResourceAlias(subAlias) {
  let resource = Services.io.getProtocolHandler("resource").QueryInterface(Ci.nsIResProtocolHandler);
  resource.setSubstitution(subAlias, null);
}

/* On add-on startup */
function startup(data, reason) {
  addonData = data;
  createResourceAlias(addonData, "ytcenter");
  
  Services.tm.currentThread.dispatch(function(){
    init();
  }, Ci.nsIEventTarget.DISPATCH_NORMAL);
}

/* On add-on shutdown */
function shutdown(data, reason) {
  if (reason == APP_SHUTDOWN)
    return;
  
  /* Call the unload listeners and remove them afterwards */
  for (let i = 0; i < unloadListeners.length; i++) {
    try { unloadListeners[i](); } catch (e) { }
  }
  unloadListeners = null; // Remove all references
  
  /* Remove all the loaded modules and their exported variables */
  for (let key in modules) {
    let module = modules[key];
    if ("nukeSandbox" in Cu) {
      Cu.nukeSandbox(module);
    } else {
      for (let v in module) {
        module[v] = null;
      }
    }
  }
  
  modules = null; // Remove all references to the module
  
  removeResourceAlias("ytcenter");
}

/* On add-on install */
function install(data, reason) { }

/* On add-on uninstall */
function uninstall(data, reason) { }