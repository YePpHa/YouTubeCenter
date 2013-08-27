YouTube Center
==============

Build
-----
YouTube Center are using a combination of ant (java) and python to build YouTube Center.

### Ant

The build system is made in ant and require ant and java to be installed.

 * `ant all` -- Builds everything below except for the styles.
 * `ant firefox` -- Builds Firefox extension (.xpi)
 * `ant xul` -- Builds the Firefox beta extension (.xpi)
 * `ant chrome` -- Builds Chrome extension (.crx)
 * `ant maxthon` -- Builds Maxthon extension (.mxaddon)
 * `ant opera` -- Builds Opera extension (.oex)
 * `ant userscript` -- Builds userscript (.user.js)
 * `ant safari` -- Makes everything ready for Safari to finish building YouTube Center.
 * `ant styles` -- Rebuilds all the styles.