var ytcenter = {};
ytcenter.modules = {};

ytcenter.modules.ytexperiments = (function(){
  function loadExperiments() {
    // YouTubeExperiments
    $XMLHTTPRequest({
      method: "GET",
      url: "https://raw.github.com/YePpHa/YouTubeCenter/master/ytexperiments.json",
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
  function update() {
    var i;
    for (i = 0; i < ytcenter.settings.YouTubeExperiments.length; i++) {
      var item = document.createElement("li");
    }
  }
  function setStatus(text) {
    
  }
  var elm = document.createElement("div");
  
  return {
    element: elm,
    bind: function(){},
    update: function(){}
  };
})();