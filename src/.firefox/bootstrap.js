const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

const {Services} = Cu.import("resource://gre/modules/Services.jsm", null);

var evalInSandbox = true; // Use evalInSandbox (true) or The Sub-Script Loader (false)

var addonData = null;
var filename = "chrome://ytcenter/content/YouTubeCenter.js";

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

/* Load a file */
function loadFile(scriptName, onload) {
  let request = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest);
  request.open("GET", scriptName, true);
  request.overrideMimeType("text/plain");
  request.onload = onload;
  
  request.send(null);
}

/* Require a library file (alike CommonJS) */
function require(module) {
  if (!(module in modules)) {
    let principal = Components.classes["@mozilla.org/systemprincipal;1"].getService(Components.interfaces.nsIPrincipal);
    let url = addonData.resourceURI.spec + "lib/" + module + ".js";
    modules[module] = Components.utils.Sandbox(principal, {
      sandboxName: url,
      sandboxPrototype: {
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
  let sandbox = require("sandbox");
  let {PolicyImplementation} = require("PolicyImplementation");
  
  let whitelist = [ /^http(s)?:\/\/(((.*?)\.youtube\.com\/)|youtube\.com\/)/, /^http(s)?:\/\/((apis\.google\.com)|(plus\.googleapis\.com))\/([0-9a-zA-Z-_\/]+)\/widget\/render\/comments\?/ ];
  let blacklist = [ /^http(s)?:\/\/apiblog\.youtube\.com\//, /^http(s)?:\/\/(((.*?)\.youtube\.com\/)|youtube\.com\/)subscribe_embed\?/ ];
  
  if (evalInSandbox) {
    loadFile(filename, function initPolicy(e) {
      let policy = new PolicyImplementation(sandbox.loadScript.bind(sandbox, whitelist, blacklist, filename, e.target.responseText));
      policy.init();
    });
  } else {
    let policy = new PolicyImplementation(sandbox.loadScript.bind(sandbox, whitelist, blacklist, filename, null));
    policy.init();
  }
  
  /*loadFile(filename, function initPolicy(e) {
    let loadScript = sandbox.loadScript.bind(sandbox, [
      /^http(s)?:\/\/(((.*?)\.youtube\.com\/)|youtube\.com\/)/,
      /^http(s)?:\/\/((apis\.google\.com)|(plus\.googleapis\.com))\/([0-9a-zA-Z-_\/]+)\/widget\/render\/comments\?/
    ], [
      /^http(s)?:\/\/apiblog\.youtube\.com\//,
      /^http(s)?:\/\/(((.*?)\.youtube\.com\/)|youtube\.com\/)subscribe_embed\?/
    ], filename, e.target.responseText);
    let policy = new PolicyImplementation(loadScript);
    
    policy.init();
  });*/
}

/* On add-on startup */
function startup(data, reason) {
  addonData = data;
  
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
}

/* On add-on install */
function install(data, reason) { }

/* On add-on uninstall */
function uninstall(data, reason) { }