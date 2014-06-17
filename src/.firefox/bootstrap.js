const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

var {Services} = Cu.import("resource://gre/modules/Services.jsm", null);
var addonData = null;
var scopes = {};
var unloadFunctions = [];
var windowEventListeners = [];
var filename = "chrome://ytcenter/content/YouTubeCenter.js";

function unload(func) {
  unloadFunctions.push(func);
}
function unloadSandbox(scope) {
  try {
    for (let v in scope) {
      try {
        scope[v] = null;
      } catch (e) { }
    }
  } catch (e) { }
  scope = null;
}

function addUnloadListener(element, event, callback, capture) {
  function callbackWrapper() {
    callback.apply(null, arguments);
    removeUnloadListener(element, event, callbackWrapper, capture, true);
  }
  windowEventListeners.push([element, event, callbackWrapper, capture]);
  element.addEventListener(event, callbackWrapper, capture);
}

function searchAndRemove(windowEventListeners, value) {
  for (let i = 0; i < windowEventListeners.length; i++) {
    if (windowEventListeners[i] == value) {
      windowEventListeners.splice(i, 1);
      break;
    }
  }
}

function removeUnloadListener(element, event, callback, capture, removeFromMemory) {
  element.removeEventListener(event, callback, capture);
  if (removeFromMemory && windowEventListeners) {
    let arr = windowEventListeners.splice();
    for (let i = 0; i < arr.length; i++) {
      if (arr[i][0] == element && arr[i][1] == event && arr[i][2] == callback && arr[i][3] == capture) {
        if (removeFromMemory) searchAndRemove(windowEventListeners, arr[i]);
      }
    }
    arr = null;
  }
}

function loadFile(scriptName, onload) {
  let request = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest);
  request.open("GET", scriptName, true);
  request.overrideMimeType("text/plain");
  request.onload = onload;
  
  request.send(null);
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
        unloadSandbox: unloadSandbox,
        addUnloadListener: addUnloadListener
      },
      wantXrays: false
    });
    Services.scriptloader.loadSubScript(url, scopes[module]);
  }
  return scopes[module].exports;
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
  let wArr = windowEventListeners.splice();
  for (let i = 0; i < wArr.length; i++) {
    wArr[i][2]();
  }
  windowEventListeners = null;
  
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
  
  scopes = null;
}

function install(data, reason) { }
function uninstall(data, reason) { }