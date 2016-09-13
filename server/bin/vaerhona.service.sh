#! /bin/sh
### BEGIN INIT INFO
# Provides: værhøna
# Required-Start: $remote_fs $syslog
# Required-Stop: $remote_fs $syslog
# Default-Start: 2 3 4 5
# Default-Stop: 0 1 6
# Short-Description: Værhøna
# Description: This file starts and stops Værhøna
# 
### END INIT INFO

APP_BIN_DIR=/var/www/html/vaerhona/server/bin

case "$1" in
 start)
   su ubuntu -c $APP_BIN_DIR/startup.sh
   ;;
 stop)
   su ubuntu -c $APP_BIN_DIR/shutdown.sh
   sleep 10
   ;;
 restart)
   su ubuntu -c $APP_BIN_DIR/restart.sh
   ;;
 *)
   echo "Usage: vaerhona {start|stop|restart}" >&2
   exit 3
   ;;
esac