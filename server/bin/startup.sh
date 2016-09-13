#! /bin/sh

APP_DIR=/var/www/html/vaerhona

NODE_ENV=production AWS_PROFILE=production forever start --sourceDir=/var/www/html/vaerhona --silent --uid "vaerhona" --append index.js