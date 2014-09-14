#!/bin/bash
(cd dist/; xar --distribution -c -f YouTubeCenter.safariextz YouTubeCenter.safariextension/)
: | openssl dgst -sign .cert/safari/key.pem -binary | wc -c > siglen.txt
xar --sign -f dist/YouTubeCenter.safariextz --digestinfo-to-sign digestinfo.dat --sig-size `cat siglen.txt` --cert-loc .cert/safari/cert00 --cert-loc .cert/safari/cert01  --cert-loc .cert/safari/cert02
openssl rsautl -sign -inkey .cert/safari/key.pem -in digestinfo.dat -out signature.dat
xar --inject-sig signature.dat -f dist/YouTubeCenter.safariextz
rm -f signature.dat digestinfo.dat siglen.txt sig.dat

read -p "Press [Enter] key to exit."