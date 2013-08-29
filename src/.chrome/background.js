var runtimeOrExtension = chrome.runtime && chrome.runtime.sendMessage ? "runtime" : "extension";

chrome[runtimeOrExtension].onMessage.addListener(
  function(request, sender, sendResponse) {
    if (typeof request === "string") request = JSON.parse(request);
    if (request.method === "setLocalStorage") {
      /*var obj = {};
      obj[request.key] = request.data;
      chrome.storage.local.set(obj, function(response){
        sendResponse(response);
      });*/
      localStorage[request.key] = request.data;
      sendResponse({ key: request.key, data: localStorage[request.key] });
    } else if (request.method === "getLocalStorage") {
      sendResponse({ key: request.key, data: localStorage[request.key] });
      /*chrome.storage.local.get(request.key, function(response){
        sendResponse(response);
      });*/
    }
  }
);