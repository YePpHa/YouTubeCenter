function getEventListener(options) {
  if (!options) return null;
  var key, item;
  for (key in yt.events.listeners_) {
    item = yt.events.listeners_[key];
    if (options.element) if (options.element !== item[0]) continue;
    if (options.event) if (options.event !== item[1]) continue;
    return item;
  }
  
  return null;
}
function addClass(elm, className) {
  if (!elm) return;
  var a = elm.className.split(" "), i;
  for (i = 0; i < a.length; i++) {
    if (a[i] === className) return;
  }
  a.push(className);
  elm.className = a.join(" ");
}
function removeClass(elm, className) {
  if (!elm) return;
  var a = elm.className.split(" "), b = [], i;
  for (i = 0; i < a.length; i++) {
    if (a[i] === className) continue;
    b.push(a[i]);
  }
  elm.className = b.join(" ");
}
(function(){
  function initActionPanel() {
    var secondaryActions = document.getElementById("watch7-secondary-actions"), i;
    for (i = 0; i < secondaryActions.children.length; i++) {
      secondaryActions.children[i].children[0].addEventListener("click", function(){
        enableActionPanel();
        setTimeout(disableActionPanel, 0);
      }, false);
    }
  }
  function enableActionPanel() {
    var secondaryActions = document.getElementById("watch7-secondary-actions"), i;
    for (i = 0; i < secondaryActions.children.length; i++) {
      addClass(secondaryActions.children[i].children[0], "action-panel-trigger");
    }
  }
  function disableActionPanel() {
    var secondaryActions = document.getElementById("watch7-secondary-actions"), i;
    for (i = 0; i < secondaryActions.children.length; i++) {
      removeClass(secondaryActions.children[i].children[0], "action-panel-trigger");
    }
  }
  var a = document.getElementById("watch-like"),
      b = getEventListener({
        event: "click",
        element: a
      }),
      c = function(){
        var sel = document.getElementById("watch7-secondary-actions").getElementsByClassName("yt-uix-button-toggled")[0],
            observer = new MutationObserver(function(mutations){
              mutations.forEach(function(mutation){
                if (mutation.type === "attributes" && mutation.attributeName === "class") {
                  addClass(sel, "yt-uix-button-toggled");
                  if (observer) observer.disconnect();
                  observer = null;
                }
              });
            });
        observer.observe(sel, { attributes: true });
        b[3]();
      };
  a.removeEventListener("click", b[3], false);
  a.addEventListener("click", c, false);
  
  initActionPanel();
  disableActionPanel();
})();