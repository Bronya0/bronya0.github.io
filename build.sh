#!/bin/bash

chown ali:ali -R /home/ali/blog/blog/static/

cd /home/ali/blog/blog/
npm rum build --silent

find /home/ali/blog/blog/build -type f \( -name "*.css" -o -name "*.js" -o -name "*.html" \) -exec gzip -k -9 {} \;