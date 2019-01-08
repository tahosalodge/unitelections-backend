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
    yarn now --force --token $ZEIT_TOKEN
    yarn now alias --token $ZEIT_TOKEN
    yarn now scale elections-api.tahosa.co all 1 --token $ZEIT_TOKEN
    yarn now rm elections-api-production --token $ZEIT_TOKEN --safe --yes
else
    echo "No environment to deploy, exiting."
fi

