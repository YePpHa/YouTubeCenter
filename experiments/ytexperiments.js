var ytcenter = {};
ytcenter.modules = {};

ytcenter.modules.ytexperiments = (function(){
  function loadExperiments() {
    // YouTubeExperiments
    $XMLHTTPRequest({
      method: "GET",
      url: "https://raw.github.com/YePpHa/YouTubeCenter/master/data/ytexperiments.json",
      headers: {
        "Content-Type": "text/plain"
      },
      onload: function(response){
        try {
          var data = JSON.parse(response.responseText);
          ytcenter.settings.YouTubeExperiments = data;
          ytcenter.saveSettings();
          
          setStatus("Updated");
          
          update();
        } catch (e) {
          setStatus("error");
        }
      },
      onerror: function(){
        setStatus("error");
      }
    });
  }
  function createListItem(data) {
    var wrapper = document.createElement("li");
    
    
    
    return wrapper;
  }
  function update() {
    var i;
    item.innerHTML = ""; // Clearing the list
    for (i = 0; i < ytcenter.settings.YouTubeExperiments.length; i++) {
      list.appendChild(createListItem(ytcenter.settings.YouTubeExperiments[i]));
    }
  }
  function setStatus(text) {
    
  }
  var elm = document.createElement("div"),
      list = document.createElement("ul");
  
  return {
    element: elm,
    bind: function(){},
    update: function(){}
  };
})();