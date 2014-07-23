function setItem(key, value) {
  var obj = {};
  obj[key] = value;
  storage.set(obj);
}

function getItem(key, callback) {
  var value = getOldItem(key);
  
  if (value === null) {
    storage.get(key, function(result) { callback(result[key]); });
  } else {
    callback(value);
  }
}

function getOldItem(key) {
  if (localStorage[key]) {  
    var val = localStorage[key];
    localStorage.removeItem(key);
    return val;
  }
  return null;
}



var runtimeOrExtension = chrome.runtime && chrome.runtime.sendMessage ? "runtime" : "extension",
var messageOrRequest = runtimeOrExtension === "extension" && !chrome.extension.onMessage ? "onRequest" : "onMessage";
var storage = chrome.storage.local;

chrome[runtimeOrExtension][messageOrRequest].addListener(
  function(request, sender, sendResponse) {
    if (typeof request === "string") request = (JSON && JSON.parse ? JSON.parse(request) : eval("(" + request + ")"));
    if (request.method === "setLocalStorage") {
      setItem(request.key, request.data);
      sendResponse(JSON.stringify({ key: request.key, data: request.data }));
    } else if (request.method === "getLocalStorage") {
      getItem(request.key, function(result){
        sendResponse(JSON.stringify({ key: request.key, data: result }));
      });
    }
  }
);