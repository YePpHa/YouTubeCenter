const data = require("self").data;
const Request = require("request").Request;
const PageMod = require("page-mod").PageMod;
const simpleStorage = require("simple-storage");
var xhr, page, workers = [];

xhr = function(details){
  try {
    var req = Request(details);
    if (details.method === "POST") {
      req.post();
    } else if (details.method === "PUT") {
      req.put();
    } else {
      req.get();
    }
  } catch (e) {
    details.onerror();
  }
};
page = PageMod({
  include: ["*.youtube.com"],
  contentScriptWhen: "start",
  contentScriptFile: data.url("YouTubeCenter.user.js"),
  onAttach: function(worker) {
    workers.push(worker);
    worker.on("detach", function() {
      var index = workers.indexOf(worker);
      if (index >= 0) workers.splice(index, 1);
    });
    worker.port.on("xhr", function(data){
      data = JSON.parse(data);
      if (data.details.onload) {
        data.details.onComplete = function(response){
          worker.port.emit("xhr onload", JSON.stringify({id: data.id, responseText: response.text}));
        };
      }
      if (data.details.onerror) {
        data.details.onerror = function(response){
          worker.port.emit("xhr onerror", JSON.stringify({id: data.id, responseText: response.text}));
        };
      }
      if (data.details.onreadystatechange) {
        data.details.onreadystatechange = function(response){
          worker.port.emit("xhr onreadystatechange", JSON.stringify({id: data.id, responseText: response.text}));
        };
      }
      xhr(data.details);
    });
    worker.port.on("save", function(data){
      data = JSON.parse(data);
      simpleStorage.storage[data.name] = data.value;
    });
    worker.port.on("load", function(data){
      data = JSON.parse(data);
      if (!simpleStorage.storage[data.name])
        simpleStorage.storage[data.name] = "{}";
      worker.port.emit("load callback", JSON.stringify({id: data.id, storage: simpleStorage.storage[data.name]}));
    });
  }
});
