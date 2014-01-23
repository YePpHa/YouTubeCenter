const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

let {Services, atob, btoa, File} = Cu.import("resource://gre/modules/Services.jsm", null);
let addonData = null;

let sandbox = null;
let policy = null;

function initPolicy() {
  sandbox = new Sandbox(
    [
      /^http(s)?:\/\/(((.*?)\.youtube\.com\/)|youtube\.com\/)/,
      /^http(s)?:\/\/((apis\.google\.com)|(plus\.googleapis\.com))\/([0-9a-zA-Z-_\/]+)\/widget\/render\/comments\?/
    ]
  );
  policy = new PolicyImplementation(
    "chrome://ytcenter/content/YouTubeCenter.user.js",
    sandbox.loadScript.bind(sandbox)
  );
  
  policy.init();
}

function startup(data, reason) {
  addonData = data;
  
  let resource = Services.io.getProtocolHandler("resource").QueryInterface(Ci.nsIResProtocolHandler);
  let alias = Services.io.newFileURI(data.installPath);
  if (!data.installPath.isDirectory())
    alias = Services.io.newURI("jar:" + alias.spec + "!/", null, null);
  resource.setSubstitution("ytcenter", alias);
  
  Cu.import("resource://ytcenter/modules/PolicyImplementation.js");
  Cu.import("resource://ytcenter/modules/Sandbox.js");
  Services.tm.currentThread.dispatch(function(){
    initPolicy();
  }, Ci.nsIEventTarget.DISPATCH_NORMAL);
}

function shutdown(data, reason) {
  if (reason === APP_SHUTDOWN)
    return;
  let resource = Services.io.getProtocolHandler("resource").QueryInterface(Ci.nsIResProtocolHandler);
  resource.setSubstitution("ytcenter", null);
  if (policy !== null) {
    policy.shutdown();
  }
}

function install(data, reason) { }
function uninstall(data, reason) { }
