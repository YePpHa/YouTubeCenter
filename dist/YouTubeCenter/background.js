var runtimeOrExtension = chrome.runtime && chrome.runtime.sendMessage ? "runtime" : "extension",
    messageOrRequest = runtimeOrExtension === "extension" && !chrome.extension.onMessage ? "onRequest" : "onMessage";

chrome[runtimeOrExtension][messageOrRequest].addListener(
  function(request, sender, sendResponse) {
    if (typeof request === "string") request = (JSON && JSON.parse ? JSON.parse(request) : eval("(" + request + ")"));
    if (request.method === "setLocalStorage") {
      /*var obj = {};
      obj[request.key] = request.data;
      chrome.storage.local.set(obj, function(response){
        sendResponse(response);
      });*/
      localStorage[request.key] = request.data;
      sendResponse(JSON.stringify({ key: request.key, data: localStorage[request.key] }));
    } else if (request.method === "getLocalStorage") {
      sendResponse(JSON.stringify({ key: request.key, data: localStorage[request.key] }));
      /*chrome.storage.local.get(request.key, function(response){
        sendResponse(response);
      });*/
    }
  }
);