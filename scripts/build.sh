#!/usr/bin/env bash -e

yarn build
yarn copyfiles src/emails/**/*.nunjucks dist/ -u 1
yarn tree-node-cli -I 'node_modules' dist
