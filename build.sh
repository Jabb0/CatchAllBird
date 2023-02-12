#!/bin/bash
set -e

# Clear build space
[ -e build ] && rm -r build

# Copy sources
cp -r src build

# Minify all contained JS sources
for file in build/**/*.js
do
    uglifyjs "$file" --compress --mangle -o "${file}.tmp"
    mv "${file}.tmp" "$file"
done

# Name the minified sources back
[ -e catchallbird.xpi ] && rm catchallbird.xpi

cd build && zip -r ../catchallbird.xpi . -x "*.sh" -x "*/\.*" -x ".*" && cd ..

# Remove build space
rm -r build