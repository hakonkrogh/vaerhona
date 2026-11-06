# vaerhona device

Node server running on a raspberry PI for collecting weather data

Compatible with sensors DHT22/11 and BMP085, and the Raspberry PiCam

## New boxes

Clone this repo and run the app from this `device/` folder. `.env`, `snapshot.jpg`
and the firmware update all use the folder the app is started from.

Boxes set up before the monorepo still track the archived `vaerhona-server` repo.
They do not get changes made here.

## SD card Image

https://blog.jaimyn.dev/the-fastest-way-to-clone-sd-card-macos/

- brew install coreutils
- diskutil list
- sudo gdd if=/dev/r<disk> of=vaerhona.dmg status=progress bs=16M
- sudo diskutil unmountDisk /dev/<disk>
- sudo gdd of=/dev/r<disk> if=vaerhona.dmg status=progress bs=16M

## Node install

$ wget -O - https://raw.githubusercontent.com/sdesalas/node-pi-zero/master/install-node-v14.17.1.sh | bash

## PM2

```
pm2 start app
pm2 stop app
pm2 list
```
