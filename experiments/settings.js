/*** module: settings.js
 * This will replace the old settings when it's finished.
 * The settings will be put into a dialog as the experimental dialog is at the moment.
 * ********************************************************************************************
 * The settings will include categories and from the categories to subcategories, where the subcateogories will contain the options.
 * It will be possible for YouTube Center to hide or disable specific categories/subcategories/options if needed.
 * ********************************************************************************************
 * The categories will be placed to the left side as the guide is on YouTube. The categories will use the same red design as the guide.
 * The subcategories will be the same as the categories in the old settings.
 * The options will be much more customizeable, where you will be able to add modules (This part is still not been planned 100% yet).
 ***/

function Module(name) {
  this.name = name;
}

function Settings() {
  this.modules = [];
}

Settings.prototype.addModule = function(module){
  this.modules.push(module);
  return module.length - 1;
};

function Category(label) {
  this.label = label;
  this.enabled = true;
  this.visible = true;
  this.subcategories = [];
}

function SubCategory(label) {
  this.label = label;
  this.enabled = true;
  this.visible = true;
  this.options = [];
}

ytcenter.settings = (function(){
  var a = {}, categories = [], subcategories = [], options = [];
  
  
  a.createCategory = function(label){
    var id = categories.length;
    categories.push({
      label: label,
      enabled: true,
      visible: true,
      subcategories: []
    });
    return a.getCategory(id);
  };
  a.createSubCategory = function(label){
    var id = subcategories.length;
    subcategories.push({
      label: label,
      enabled: true,
      visible: true,
      options: []
    });
    return a.getSubCategory(id);
  };
  a.createOption = function(){
    
  };
  a.getCategory = function(id){
    if (categories.length <= id || id < 0) throw new Error("[Settings Category] Category with specified id doesn't exist!");
    var cat = categories[i];
    return {
      getId: function(){
        return id;
      },
      setVisibility: function(visible){
        cat.visible = visible;
      },
      setEnabled: function(enabled){
        cat.enabled = enabled;
      },
      addSubCategory: function(subcategory){
        cat.subcategories.push(subcategory);
      }
    };
  };
  a.getSubCategory = function(id){
    if (subcategories.length <= id || id < 0) throw new Error("[Settings SubCategory] Category with specified id doesn't exist!");
    var subcat = subcategories[i];
    return {
      getId: function(){
        return id;
      },
      setVisibility: function(visible){
        subcat.visible = visible;
      },
      setEnabled: function(enabled){
        subcat.enabled = enabled;
      },
      addOption: function(option){
        subcat.options.push(option);
      }
    };
  };
  a.getOption = function(id){
    throw new Error("[Settings getOption] Not implemented!");
  };
  
  a.createDialog = function(){
    throw new Error("[Settings createDialog] Not implemented!");
  };
})();

// Creating Categories
var general = ytcenter.settings.createCategory("General"),
    player = ytcenter.settings.createCategory("Player"),
    ui = ytcenter.settings.createCategory("UI"),
    update = ytcenter.settings.createCategory("Update"),
    debug = ytcenter.settings.createCategory("Debug"),
    about = ytcenter.settings.createCategory("About");

// Creating Subcategories
var general_subcat1 = ytcenter.settings.createSubCategory("Alpha"),
    general_subcat2 = ytcenter.settings.createSubCategory("Beta"),
    player_watch = ytcenter.settings.createSubCategory("Watch"),
    player_channel = ytcenter.settings.createSubCategory("Channel"),
    player_embed = ytcenter.settings.createSubCategory("Embed"),
    ui_videothumbnail = ytcenter.settings.createSubCategory("Video Thumbnail"),
    ui_comments = ytcenter.settings.createSubCategory("Comments"),
    ui_subscriptions = ytcenter.settings.createSubCategory("Subscriptions"),
    update_general = ytcenter.settings.createSubCategory("General"),
    update_channel = ytcenter.settings.createSubCategory("Channel"),
    debug_log = ytcenter.settings.createSubCategory("Log"),
    debug_options = ytcenter.settings.createSubCategory("Options"),
    about_about = ytcenter.settings.createSubCategory("About"),
    about_share = ytcenter.settings.createSubCategory("Share"),
    about_donate = ytcenter.settings.createSubCategory("Donate");

// Linking categories with subcategories
general.addSubCategory(general_subcat1);
general.addSubCategory(general_subcat2);

player.addSubCategory(player_watch);
player.addSubCategory(player_channel);
player.addSubCategory(player_embed);

ui.addSubCategory(ui_videothumbnail);
ui.addSubCategory(ui_comments);
ui.addSubCategory(ui_subscriptions);

update.addSubCategory(update_general);
update.addSubCategory(update_channel);

debug.addSubCategory(debug_log);
debug.addSubCategory(debug_options);

about.addSubCategory(about_about);
about.addSubCategory(about_share);
about.addSubCategory(about_donate);

// Creating options
...

// Linking options to subcategories
...

// Creating settings element
var dialog = ytcenter.settings.createDialog();

// Displaying the settings
dialog.setVisibility(true);