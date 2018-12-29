#!/usr/bin/env bash -e

if [ $CIRCLE_BRANCH = "master" ]
  then
    cp ./.now/production.json ./now.json
fi

if [ $CIRCLE_BRANCH = "develop" ]
  then
    cp ./.now/staging.json ./now.json
fi

if [ -e now.json ]
then
    yarn build
    yarn copyfiles src/emails/**/*.nunjucks dist/ -u 1
    yarn now --force --token $ZEIT_TOKEN
    yarn now alias --token $ZEIT_TOKEN
    yarn now scale elections-api.tahosa.co all 1 --token $ZEIT_TOKEN
else
    echo "No environment to deploy, exiting."
fi

