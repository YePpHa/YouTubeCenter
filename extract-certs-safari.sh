#!/bin/bash
echo To correctly set everything up, please make sure that you\'ve installed xar from \'http://mackyle.github.io/xar/\'.
read -p "Press [Enter] key to continue."

echo Then create the correct certificate by following \'http://stackoverflow.com/questions/16011066/safari-extension-developer-certificate-windows\'.
read -p "Press [Enter] key to continue."

echo Rename \'privateKey.key\' to \'key.pem\' and move it to \'.cert/Safari/\'.
read -p "Press [Enter] key to continue."

echo Build the YouTube Center Safari extension by using Safari.
read -p "Press [Enter] key to extract certificates from the Safari extension."

xar -f dist/YouTubeCenter.safariextz --extract-certs .cert/safari/

echo Certificates are now extracted and the Safari extension can now be build by calling \'./build-safari.sh\'.