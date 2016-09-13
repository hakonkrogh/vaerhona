#! /bin/sh

APP_DIR=/var/www/html/vaerhona

NODE_ENV=production AWS_PROFILE=production forever restart --sourceDir=$APP_DIR --silent --uid "vaerhona" index.js