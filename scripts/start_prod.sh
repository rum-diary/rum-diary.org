#!/bin/bash

NODE_ENV=production CONFIG_FILES=./server/etc/production.json forever start ./scripts/run_locally.js
