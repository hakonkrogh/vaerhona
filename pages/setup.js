import { useState } from 'react';

const primaryServiceUuid = '601202ac-16d1-4f74-819d-85788a5ad77a';

const txtD = new TextDecoder('utf-8');
const txtE = new TextEncoder('utf-8');

let device, server, service, firstCharacteristic;

export default function Setup() {
  const [isConnected, setIsConnected] = useState(false);
  const [sensorValues, setSensorValues] = useState(null);
  const [wifiSettings, setWifiSettings] = useState(null);

  function onDisconnected() {
    device = null;
    server = null;
    service = null;
    firstCharacteristic = null;
    setIsConnected(false);
    alert('device disconnected');
  }

  async function connect() {
    device = await navigator.bluetooth.requestDevice({
      // acceptAllDevices: true,
      // optionalServices: [primaryServiceUuid],
      filters: [{ name: 'Vaerhona' }],
    });
    console.log({ device });
    server = await device.gatt.connect();
    console.log({ server });
    service = await server.getPrimaryService(primaryServiceUuid);
    console.log({ service });

    const characteristics = await service.getCharacteristics();
    firstCharacteristic = characteristics[0];
    await firstCharacteristic.startNotifications();

    // Listen for changes in value
    firstCharacteristic.oncharacteristicvaluechanged = function onChange(e) {
      try {
        const value = JSON.parse(txtD.decode(e.target.value));
        switch (value.action) {
          case 'sensor-reading': {
            setSensorValues(value.data);
            break;
          }
          case 'wifi-settings': {
            setWifiSettings(value.data);
            break;
          }
        }
      } catch (e) {
        console.log(e);
      }
    };

    setIsConnected(true);

    device.ongattserverdisconnected = onDisconnected;
  }

  function send(message) {
    firstCharacteristic.writeValue(txtE.encode(JSON.stringify(message)));
  }

  function onWifiSettingsUpdateSubmit(e) {
    e.preventDefault();
    const vals = Object.fromEntries(new FormData(e.target));

    send({
      action: 'set-wifi',
      data: {
        ssid: vals.ssid,
        psk: vals.psk,
      },
    });
  }

  return (
    <div>
      {!isConnected ? (
        <button type="button" onClick={connect}>
          Connect
        </button>
      ) : (
        <div>
          <button type="button" onClick={() => device.gatt.disconnect()}>
            Disconnect
          </button>
          {sensorValues && <pre>{JSON.stringify(sensorValues, null, 1)}</pre>}
          <div>
            <button onClick={() => send({ action: 'reboot' })}>Reboot</button>
            <button onClick={() => send({ action: 'shutdown' })}>
              Shutdown
            </button>
          </div>
          <div>
            <button onClick={() => send({ action: 'take-snapshot' })}>
              Take snapshot
            </button>
          </div>
          <div>
            <button onClick={() => send({ action: 'firmware-update' })}>
              Update firmware
            </button>
          </div>
          <div>
            Wifi:
            {!wifiSettings ? (
              <button
                onClick={() =>
                  send({
                    action: 'get-wifi',
                  })
                }
              >
                Get WIFI settings
              </button>
            ) : (
              <form onSubmit={onWifiSettingsUpdateSubmit}>
                <div>
                  SSID: <input name="ssid" defaultValue={wifiSettings.ssid} />
                </div>
                <div>
                  PSK: <input name="psk" defaultValue={wifiSettings.psk} />
                </div>
                <button type="submit">Update</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
