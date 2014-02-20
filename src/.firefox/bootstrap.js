const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

var {Services} = Cu.import("resource://gre/modules/Services.jsm", null);
var addonData = null;
var scopes = {};
var scopesArray = [];
var unloadFunctions = [];

function unload(func) {
  unloadFunctions.push(func);
}
function unloadSandbox(scope) {
  for (let v in scope) {
    scope[v] = null;
  }
  scope = null;
}

function require(module) {
  if (!(module in scopes)) {
    let principal = Components.classes["@mozilla.org/systemprincipal;1"].getService(Components.interfaces.nsIPrincipal);
    let url = addonData.resourceURI.spec + "lib/" + module + ".js";
    scopes[module] = Components.utils.Sandbox(principal, {
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
    Services.scriptloader.loadSubScript(url, scopes[module]);
  }
  return scopes[module].exports;
}

function initPolicy() {
  let {Sandbox} = require("sandbox");
  let {PolicyImplementation} = require("PolicyImplementation");
  
  let sandbox = new Sandbox(
    [
      /^http(s)?:\/\/(((.*?)\.youtube\.com\/)|youtube\.com\/)/,
      /^http(s)?:\/\/((apis\.google\.com)|(plus\.googleapis\.com))\/([0-9a-zA-Z-_\/]+)\/widget\/render\/comments\?/
    ]
  );
  let policy = new PolicyImplementation(
    "chrome://ytcenter/content/YouTubeCenter.user.js",
    sandbox.loadScript.bind(sandbox)
  );
  
  policy.init();
}

function startup(data, reason) {
  addonData = data;
  
  Services.tm.currentThread.dispatch(function(){
    initPolicy();
  }, Ci.nsIEventTarget.DISPATCH_NORMAL);
}

function shutdown(data, reason) {
  if (reason === APP_SHUTDOWN)
    return;
  
  for (let i = 0; i < unloadFunctions.length; i++) {
    unloadFunctions[i]();
  }
  unloadFunctions = null;
  
  for (let key in scopes) {
    let scope = scopes[key];
    for (let v in scope) {
      scope[v] = null;
    }
    scopes[key] = null;
  }
  for (let i = 0; i < scopesArray.length; i++) {
    let scope = scopesArray[i];
    for (let v in scope) {
      scope[v] = null;
    }
    scopesArray[i] = null;
  }
  
  scopes = null;
  scopesArray = null;
}

function install(data, reason) { }
function uninstall(data, reason) { }
