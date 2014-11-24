const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

const conService = Cc['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService);
const console = {
  log: function(a, b, c, d, e){ conService.logStringMessage(a, b, c, d, e); },
  error: function(a, b, c, d, e){ Cu.reportError(a, b, c, d, e); }
};

var filename = "resource://ytcenter/data/YouTubeCenter.js";

var whitelist = [ /^http(s)?:\/\/(www\.)?youtube\.com\//, /^http(s)?:\/\/((apis\.google\.com)|(plus\.googleapis\.com))\/([0-9a-zA-Z-_\/]+)\/widget\/render\/comments\?/ ];
var blacklist = [ ];

var modules = {}; // The loaded modules (alike CommonJS)
var unloadListeners = []; // The unload listeners which will be called when the add-on needs to be unloaded (uninstall, reinstall, shutdown).

function loadFile(scriptName) {
  let request = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest);
  request.open("GET", scriptName, true);
  request.overrideMimeType("text/plain");
  request.send(null);
  
  return request.responseText;
}

/* Require a library file (alike CommonJS) */
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
        Cu: Cu,
        unload: function(){},
        removeUnloadListener: function(){},
        framescript: {
          sendSyncMessage: sendSyncMessage.bind(this)
        },
        console: console
      },
      wantXrays: false
    });
    Services.scriptloader.loadSubScript(url, modules[module]);
  }
  return modules[module].exports;
}

function init() {
  console.log("Frame Script init");
  let {ContentService} = require("service/ContentService");
  
  let service = new ContentService(whitelist, blacklist, filename, loadFile(filename));
  service.init();
}

init();