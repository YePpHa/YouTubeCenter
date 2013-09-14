ytcenter.modules.translators = function(option){
  option = typeof option !== "undefined" ? option : false;
  var elm = document.createElement("div");
  
  var translators = document.createElement("div"),
      table = document.createElement("table"),
      thead = document.createElement("thead"),
      tbody = document.createElement("tbody"),
      tr, td;
  table.className = "ytcenter-settings-table";
  tr = document.createElement("tr");
  td = document.createElement("td");
  td.textContent = ytcenter.language.getLocale("TRANSLATOR_LANGUAGE");
  ytcenter.language.addLocaleElement(td, "TRANSLATOR_LANGUAGE", "@textContent");
  tr.appendChild(td);
  
  td = document.createElement("td");
  td.textContent = ytcenter.language.getLocale("TRANSLATOR_ENGLISH");
  ytcenter.language.addLocaleElement(td, "TRANSLATOR_ENGLISH", "@textContent");
  tr.appendChild(td);
  
  td = document.createElement("td");
  td.textContent = ytcenter.language.getLocale("TRANSLATOR_CONTRIBUTORS");
  ytcenter.language.addLocaleElement(td, "TRANSLATOR_CONTRIBUTORS", "@textContent");
  tr.appendChild(td);
  
  thead.appendChild(tr);
  
  table.appendChild(thead);
  table.appendChild(tbody);
  ytcenter.utils.each(option.args.translators, function(key, value){
    if (value.length > 0) {
      tr = document.createElement("tr");
      td = document.createElement("td");
      td.textContent = ytcenter.language.getLocale("LANGUAGE", key);
      tr.appendChild(td);
      td = document.createElement("td");
      td.textContent = ytcenter.language.getLocale("LANGUAGE_ENGLISH", key);
      tr.appendChild(td);
      td = document.createElement("td");

      for (var i = 0; i < value.length; i++) {
        if (i > 0) td.appendChild(document.createTextNode(" & "));
        var el;
        if (value[i].url) {
          el = document.createElement("a");
          el.href = value[i].url;
          el.textContent = value[i].name;
          el.setAttribute("target", "_blank");
        } else {
          el = document.createTextNode(value[i].name);
        }
        td.appendChild(el);
      }
      tr.appendChild(td);
      tbody.appendChild(tr);
    }
  });
  translators.appendChild(table);
  elm.appendChild(translators);
  
  return {
    element: elm,
    bind: function(){},
    update: function(){}
  };
};