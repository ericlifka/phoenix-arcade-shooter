#!/usr/bin/env bash
tar cvzf build.tar.gz favicon.ico index.html webgl-demo.html modules.js styles/ src/

git co gh-pages

rm -r src/
rm index.html
rm modules.js

tar -xf build.tar.gz
rm build.tar.gz

git add --all
git commit -m "auto build"
git push

git co master
