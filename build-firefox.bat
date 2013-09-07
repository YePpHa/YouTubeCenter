CALL SDK\firefox-addon-sdk-1.14\bin\activate.bat

cd build\YouTubeCenter
CALL cfx xpi --force-mobile

move youtube-center.xpi ..\..\dist\YouTubeCenter-legacy.xpi
cd ..\..\
ant clean