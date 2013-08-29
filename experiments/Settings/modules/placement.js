ytcenter.modules.placement = function(args){
  function createListItem(content) {
    var a = document.createElement("li");
    a.className = "ytcenter-module-placement-item";
    a.textContent = content;
    return a;
  }
  var template = [
    {
      "type": "block",
      "id": "player",
      "prepend": true,
      "insert": false,
      "append": false,
      "content": "Player"
    }, {
      "type": "interactive",
      "id": "watch7-headline",
      "prepend": true,
      "insert": true,
      "append": false
    }, {
      "type": "interactive",
      "id": "watch7-sentiment-actions",
      "prepend": true,
      "insert": true,
      "append": false
    }
  ],
  predefinedElements = [
    {
      "parent": "watch7-sentiment-actions",
      "id": "watch-like-dislike-buttons",
      "content": "Like/Dislike"
    }, {
      "parent": "watch7-headline",
      "id": "watch-headline-title",
      "content": "TITLE"
    }
  ];
  var elm = document.createElement("div"), i, j, a, b, c;
  
  for (i = 0; i < template.length; i++) {
    a = document.createElement("ol");
    if (template[i].type === "interactive") {
      a.className = "ytcenter-moduel-placement-interactive";
    } else if (template[i].type === "block") {
      a.className = "ytcenter-moduel-placement-block";
    } else if (template[i].type === "hidden") {
      a.className = "ytcenter-moduel-placement-hidden";
    }
    if (template[i].content) a.textContent = template[i].content;
    if (template[i].prepend) {
      b = document.createElement("ol");
      b.className = "ytcenter-moduel-placement-empty";
      b.textContent = "+";
      elm.appendChild(b);
    }
    if (template[i].insert) {
      for (j = 0; j < predefinedElements.length; j++) {
        if (predefinedElements[j].parent === template[i].id) {
          c = createListItem(predefinedElements[j].content);
          a.appendChild(c);
        }
      }
    }
    elm.appendChild(a);
    if (template[i].append) {
      b = document.createElement("ol");
      b.className = "ytcenter-moduel-placement-empty";
      b.textContent = "+";
      elm.appendChild(b);
    }
  }
  
  return {
    element: elm,
    update: function(){},
    bind: function(){}
  };
};