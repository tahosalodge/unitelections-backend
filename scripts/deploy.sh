#!/usr/bin/env bash

if [ $CIRCLE_BRANCH = "master" ]
  then
    echo ${NOW_PRODUCTION} > ./now.json
fi

if [ $CIRCLE_BRANCH = "develop" ]
  then
    echo ${NOW_STAGING} > ./now.json
fi

if [ -e now.json ]
then
    yarn build
    yarn copy-templates || { echo 'copy failed' ; exit 1; }
    yarn now --force --token $ZEIT_TOKEN || { echo 'now deploy failed' ; exit 1; }
    yarn now alias --token $ZEIT_TOKEN || { echo 'alias failed' ; exit 1; }
else
    echo "No environment to deploy, exiting."
fi

