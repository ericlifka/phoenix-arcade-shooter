#!/usr/bin/env bash
cd dist
tar cvzf build.tar.gz favicon.ico index.html game.css phoenix-arcade-shooter.js
cd ..

git co gh-pages

rm -r src/
rm index.html
rm modules.js
rm favicon.ico
rm game.css
rm phoenix-arcade-shooter.js

tar -xf build.tar.gz
rm build.tar.gz

git add --all
git commit -m "auto build"
git push

git co master
