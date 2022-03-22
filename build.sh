#!/bin/bash
set -e
rm -r build
# Copy sources
cp -r src build
# Minify all contained JS sources
for file in build/**/*.js
do
    uglifyjs "$file" --compress --mangle -o "${file}.tmp"
    mv "${file}.tmp" "$file"
done
# Name the minified sources back
zip -r catchallbird.xpi build -x "*.sh" -x "*/\.*" -x ".*"
# Remove tmp folder
rm -r build