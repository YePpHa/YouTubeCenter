YouTube Center
==============

Build
-----
YouTube Center are using a combination of ant (Java), python and executables to build YouTube Center.

### Ant

The build system is made in ant and require ant and java to be installed.

 * `ant all` -- Build everything below except for the styles.
 * `ant firefox` -- Build the Firefox addon (.xpi)
 * `ant firefox-legacy` -- Build the Firefox legacy addon (.xpi)
 * `ant chrome` -- Build the Chrome extension (.crx)
 * `ant maxthon` -- Build the Maxthon extension (.mxaddon)
 * `ant opera` -- Build the Opera extension (.oex)
 * `ant userscript` -- Build the userscript (.user.js)
 * `ant safari` -- Makes everything ready for Safari to finish building YouTube Center.
 * `ant styles` -- Rebuilds all the styles.