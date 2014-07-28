#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

NODE_ENV=production CONFIG_FILES=./server/etc/production.json forever start $DIR/../server/start.js

