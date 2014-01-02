YouTube Center
==============

Build
-----
YouTube Center are using the build system [Ant](http://ant.apache.org/).

### Base requirements
 * Computer
 * [Java SDK](http://www.oracle.com/technetwork/java/javase/downloads/index.html)
 * [Ant](http://ant.apache.org/)

### Optional requirements
To build the Chrome or Maxthon extension it is required to be able to run executable, which can be done in Wine on Linux or on a Windows computer.

It is possible to build the unpacked version of the Chrome or Maxthon extension without the need to run executables:
 * `ant copy-chrome` -- Makes the required files to build the extension file (.crx) ready in the build directory.
 * `ant copy-maxthon` -- Makes the required files to build the extension file (.mxaddon) ready in the build directory.

### Signing
The certificates for signing the extensions have to be provided by yourself and have to be placed in:
 * `/.cert/chrome/`
 * `/.cert/safari/`
 
It should be noted that the ant build will create a new signing key for Chrome if it's missing from `/.cert/chrome/` (Running executables is required).
 
### Ant
The build system is made in ant and require ant and java to be installed.

 * `ant all` -- Build everything below except for the styles.
 * `ant devnumber` -- Increment the build number.
 * `ant firefox` -- Build the Firefox addon (.xpi)
 * `ant chrome` -- Build the Chrome extension (.crx)
 * `ant maxthon` -- Build the Maxthon extension (.mxaddon)
 * `ant opera` -- Build the Opera extension (.oex)
 * `ant userscript` -- Build the userscript (.user.js)
 * `ant safari` -- Makes everything ready for Safari to finish building YouTube Center.
 * `ant styles` -- Minifies the styles used. This is needed to be called everytime a change in the styles is made.

### Build Properties (build.properties)
The keys in this file have the prefix and suffix `@`.

 * `devbuild` -- Set to true if you want to create a developer build and false if it's a stable release.
 * `ant-version` -- The stable version.
 * `ant-revision` -- The stable revision used to check if it's a newer version.
 * `pastebin-api-key` -- The pastebin API key used by YouTube Center to post the debug log on pastebin.
 * `name-stable` -- The name of the extensions for the stable version.
 * `name-dev` -- The name of the extensions for the developer version.
 * `stable-downloadURL` -- The location of the newest version of YouTube Center for the stable version.
 * `stable-updateURL` -- The location of the userscript header to check if a new version of YouTube Center is available for the stable version.
 * `dev-downloadURL` -- The location of the newest version of YouTube Center for the developer version.
 * `dev-updateURL` -- The location of the userscript header to check if a new version of YouTube Center is available for the developer version.
 * `firefox-target-id` -- Used in the Firefox extension manifest to specify which platform the extension is targeted towards.
 * `firefox-target-min-version` -- The minimum version of the targeted platform.
 * `firefox-target-max-version` -- The maximum version of the targeted platform.
 * `firefox-target-mobile-id` -- The mobile platform id.
 * `firefox-target-mobile-min-version` -- The minimum version of the mobile platform.
 * `firefox-target-mobile-max-version` -- The maximum version of the mobile platform.
 * `firefox-update-link` -- The location of the newest version of the developer version of YouTube Center for Firefox is located.
 * `firefox-update-rdf` -- The location of the file, which Firefox uses to check if a new version of the developer version of YouTube Center is available.
 * `chrome-id` -- The id of the Chrome extension. The id can be found in `chrome://extensions/` or calculated from the signing key.
 * `chrome-update-xml` -- The location of the file, which Chrome uses to check if a new version of the developer version of YouTube Center is available.
 * `chrome-update-file` -- The location of the newest version of the developer version of YouTube Center for Chrome is located.
