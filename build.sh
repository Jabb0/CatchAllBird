#!/bin/bash
set -e
zip -r catchallbird.xpi . -x "*.sh" -x "*/\.*" -x ".*"