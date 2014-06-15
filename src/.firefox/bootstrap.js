const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

var {Services} = Cu.import("resource://gre/modules/Services.jsm", null);
var addonData = null;
var modules = {};
var unloadFunctions = [];
var filename = "chrome://ytcenter/content/YouTubeCenter.js";

function unload(func) {
  unloadFunctions.push(func);
}

function unloadSandbox(sandbox) {
  nukeSandbox(sandbox);
}

function nukeSandbox(sandbox) {
  if ("nukeSandbox" in Cu) {
    // Bug 775067: From FF17 we can kill all CCW from a given sandbox
    Cu.nukeSandbox(sandbox);
  }
}

function unloadSandboxes() {
  for (let key in modules) {
    let sandbox = modules[key];
    for (let v in sandbox) {
      delete sandbox[v];
    }
    delete modules[key];
    
    nukeSandbox(sandbox);
    delete sandbox;
  }
  delete modules;
}

function loadFile(scriptName, onload) {
  let request = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest);
  request.open("GET", scriptName, true);
  request.overrideMimeType("text/plain");
  request.onload = onload;
  
  request.send(null);
}

function require(module) {
  if (!(module in modules)) {
    let principal = Cc["@mozilla.org/systemprincipal;1"].getService(Components.interfaces.nsIPrincipal);
    let url = addonData.resourceURI.spec + "lib/" + module + ".js";
    modules[module] = Cu.Sandbox(principal, {
      sandboxName: url,
      sandboxPrototype: {
        require: require,
        exports: {},
        Cc: Cc,
        Ci: Ci,
        Cr: Cr,
        Cu: Cu,
        unload: unload,
        unloadSandbox: unloadSandbox
      },
      wantXrays: false
    });
    Services.scriptloader.loadSubScript(url, modules[module]);
  }
  return modules[module].exports;
}

function init() {
  let {Sandbox} = require("sandbox");
  let {PolicyImplementation} = require("PolicyImplementation");
  
  loadFile(filename, function initPolicy(e) {
    let sandbox = new Sandbox(
      [
        /^http(s)?:\/\/(((.*?)\.youtube\.com\/)|youtube\.com\/)/,
        /^http(s)?:\/\/((apis\.google\.com)|(plus\.googleapis\.com))\/([0-9a-zA-Z-_\/]+)\/widget\/render\/comments\?/
      ], [
        /^http(s)?:\/\/apiblog\.youtube\.com\//,
        /^http(s)?:\/\/(((.*?)\.youtube\.com\/)|youtube\.com\/)subscribe_embed\?/
      ]
    );
    let policy = new PolicyImplementation(filename, e.target.responseText, sandbox.loadScript.bind(sandbox));
    
    policy.init();
  });
}

function startup(data, reason) {
  addonData = data;
  
  Services.tm.currentThread.dispatch(function(){
    init();
  }, Ci.nsIEventTarget.DISPATCH_NORMAL);
}

function shutdown(data, reason) {
  if (reason == APP_SHUTDOWN)
    return;
  
  for (let i = 0; i < unloadFunctions.length; i++) {
    unloadFunctions[i]();
    unloadFunctions.splice(i, 1);
    i--;
  }
  delete unloadFunctions;
  
  unloadSandboxes();
}

function install(data, reason) { }
function uninstall(data, reason) { }
