--Build--
1. Download the current translation sheet from https://docs.google.com/spreadsheet/ccc?key=0AhHfBBHelFnAdF9fWHlVaHlGdUYteFNUUFVpeTIta2c as Translation.xlsx
2. Replace it with the current Translation.xlsx
3. Run convert.bat (will run YouTubeCenterLanguageToJSON.jar) which will create the language.json
4. Run command "ant userscript" to build userscript.

--ANT--
Commands:
  ant all         #Builds Firefox extension, Chrome extension, Maxthon extension, Opera extension and userscript.
  ant firefox     #Builds Firefox extension
  ant chrome      #Builds Chrome extension
  ant maxthon     #Builds Maxthon extension
  ant opera       #Builds Opera extension (Needs update)
  ant userscript  #Builds userscript