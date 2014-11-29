var filename = "resource://ytcenter/data/YouTubeCenter.js";

var whitelist = [ /^http(s)?:\/\/(www\.)?youtube\.com\//, /^http(s)?:\/\/((apis\.google\.com)|(plus\.googleapis\.com))\/([0-9a-zA-Z-_\/]+)\/widget\/render\/comments\?/ ];
var blacklist = [ ];

var modules = {}; // The loaded modules (alike CommonJS)
var unloadListeners = []; // The unload listeners which will be called when the add-on needs to be unloaded (uninstall, reinstall, shutdown).

function loadFile(scriptName) {
  let request = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Components.interfaces.nsIXMLHttpRequest);
  request.open("GET", scriptName, true);
  request.overrideMimeType("text/plain");
  request.send(null);
  
  return request.responseText;
}

/* Require a library file (alike CommonJS) */
function require(module) {
  if (!(module in modules)) {
    let principal = Components.classes["@mozilla.org/systemprincipal;1"].getService(Components.interfaces.nsIPrincipal);
    let url = "resource://ytcenter/libs/" + module + ".js";
    modules[module] = Components.utils.Sandbox(principal, {
      sandboxName: url,
      sandboxPrototype: {
        inFrameScript: true,
        require: require,
        exports: {},
        Cc: Components.classes,
        Ci: Components.interfaces,
        Cr: Components.results,
        Cu: Components.utils,
        unload: function(){},
        removeUnloadListener: function(){},
        framescript: {
          sendSyncMessage: sendSyncMessage.bind(this)
        }
      },
      wantXrays: false
    });
    Services.scriptloader.loadSubScript(url, modules[module]);
  }
  return modules[module].exports;
}

function init() {
  let {ContentService} = require("service/ContentService");
  
  let service = new ContentService(whitelist, blacklist, filename, loadFile(filename));
  service.init();
}

init();