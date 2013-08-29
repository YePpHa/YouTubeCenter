ytcenter.modules.aboutText = function(option){
  var elm = document.createElement("div");
  
  var content1 = document.createElement("div");
  content1.textContent = ytcenter.language.getLocale("SETTINGS_ABOUT_COPYRIGHTS");
  ytcenter.language.addLocaleElement(content1, "SETTINGS_ABOUT_COPYRIGHTS", "@textContent", {});
  
  var content2 = document.createElement("div");
  content2.textContent = ytcenter.language.getLocale("SETTINGS_ABOUT_CONTACTSINFO");
  ytcenter.language.addLocaleElement(content2, "SETTINGS_ABOUT_CONTACTSINFO", "@textContent", {});
  
  var contact = document.createElement("div"),
      contactText = document.createTextNode(ytcenter.language.getLocale("SETTINGS_ABOUT_EMAIL")),
      contactTextEnd = document.createTextNode(":"),
      contactLink = document.createElement("a");
  ytcenter.language.addLocaleElement(contactText, "SETTINGS_ABOUT_EMAIL", "@textContent", {});
  
  contactLink.href = "mailto:jepperm@gmail.com";
  contactLink.textContent = "jepperm@gmail.com";
  
  contact.appendChild(contactText);
  contact.appendChild(contactTextEnd);
  contact.appendChild(contactLink);
  
  elm.appendChild(content1);
  elm.appendChild(document.createElement("br"));
  elm.appendChild(content2);
  elm.appendChild(contact);
  
  return {
    element: elm,
    bind: function(){},
    update: function(){}
  };
};