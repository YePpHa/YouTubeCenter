const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

const {Services} = Cu.import("resource://gre/modules/Services.jsm", null);

var globalMM = null;

var addonData = null;
var startupService = null;

// Bug 1051238, https://bugzilla.mozilla.org/show_bug.cgi?id=1051238
var frameScriptURL = "resource://ytcenter/libs/framescript.js?" + Math.random();

var modules = {}; // The loaded modules (alike CommonJS)

function require(module) {
  if (!(module in modules)) {
    let principal = Cc["@mozilla.org/systemprincipal;1"].getService(Ci.nsIPrincipal);
    let url = "resource://ytcenter/libs/" + module + ".js";
    modules[module] = Cu.Sandbox(principal, {
      sandboxName: url,
      sandboxPrototype: {
        require: require,
        exports: {},
        Cc: Cc,
        Ci: Ci,
        Cr: Cr,
        Cu: Cu
      },
      wantXrays: false
    });
    Services.scriptloader.loadSubScript(url, modules[module]);
  }
  return modules[module].exports;
}

/* Load a file */
function loadFile(scriptName, onload) {
  let request = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest);
  request.open("GET", scriptName, true);
  request.overrideMimeType("text/plain");
  //request.onload = onload;
  
  request.send(null);
  
  return request.responseText;
}

function shimFileAccess(detail) {
  var fileaccess = require("fileaccess");
  
  var data = detail.data;
  
  var method = data.method;
  var args = data.args;
  
  return fileaccess[method].apply(null, args);
}

/* Initialize YouTube Center */
function init() {
  globalMM = Cc["@mozilla.org/globalmessagemanager;1"].getService(Ci.nsIMessageListenerManager);
  
  globalMM.addMessageListener("fileaccess-shim", shimFileAccess);
  
  var service = require("service/StartupService");
  
  startupService = new service.StartupService();
  startupService.init();
  service.startup(startupService);
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
  globalMM.removeMessageListener("fileaccess-shim", shimFileAccess);
  startupService.unload();
  startupService = null;
  
  removeResourceAlias("ytcenter");
  
  globalMM = null;
}

/* On add-on install */
function install(data, reason) { }

/* On add-on uninstall */
function uninstall(data, reason) { }