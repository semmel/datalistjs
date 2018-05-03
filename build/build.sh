#!/usr/bin/env bash

#######
# Bundle all files for DatalistJS
#
#######

cd build

####### production bundle ########

echo "=== creating the production build.."

r.js -o build.js

echo "done."

####### development bundle ########

echo "=== creating the uncompressed production build.."

r.js -o build.js optimize=none out=../dist/datalist.js

echo "done."