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
    yarn now --force --token $ZEIT_TOKEN
    yarn now alias --token $ZEIT_TOKEN
else
    echo "No environment to deploy, exiting."
fi

