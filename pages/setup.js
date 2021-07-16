import { useState } from 'react';
import {
  Button,
  Container,
  Divider,
  Group,
  InputWrapper,
  Input,
} from '@mantine/core';

import { Temperature, Humidity } from 'ui';

const primaryServiceUuid = '601202ac-16d1-4f74-819d-85788a5ad77a';

const txtD = new TextDecoder('utf-8');
const txtE = new TextEncoder('utf-8');

let device, server, service, firstCharacteristic;

export default function Setup() {
  const [isConnected, setIsConnected] = useState(false);
  const [sensorValues, setSensorValues] = useState(null);
  const [wifiSettings, setWifiSettings] = useState(null);

  if (typeof window === 'undefined') {
    return null;
  }

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
      optionalServices: [primaryServiceUuid],
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
    <Container size="sm">
      {!isConnected ? (
        <div
          style={{
            display: 'flex',
            minHeight: '80vh',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Button type="button" onClick={connect}>
            Søk etter en Værhøne
          </Button>
        </div>
      ) : (
        <div>
          <Group position="apart" spacing="sm" style={{ margin: '8px 0' }}>
            <Button onClick={() => send({ action: 'take-snapshot' })}>
              Ta bilde
            </Button>
            <div>
              <Group position="apart" spacing="md">
                <Button
                  size="xs"
                  variant="light"
                  type="button"
                  onClick={() => device.gatt.disconnect()}
                >
                  Koble fra
                </Button>

                <Button
                  size="xs"
                  variant="light"
                  onClick={() => send({ action: 'reboot' })}
                >
                  Start på nytt
                </Button>

                <Button
                  size="xs"
                  variant="light"
                  onClick={() => send({ action: 'shutdown' })}
                >
                  Skru av
                </Button>
              </Group>
            </div>
          </Group>
          <Divider />
          <Group
            position="center"
            spacing="xl"
            style={{ padding: '16px', fontSize: 50 }}
          >
            <Temperature {...sensorValues} />
            <Divider orientation="vertical" margins="xs" />
            <Humidity {...sensorValues} />
          </Group>
          <Divider />
          <Group style={{ padding: '16px 0' }}>
            {!wifiSettings ? (
              <Button
                variant="light"
                onClick={() =>
                  send({
                    action: 'get-wifi',
                  })
                }
              >
                Endre wifi
              </Button>
            ) : (
              <form onSubmit={onWifiSettingsUpdateSubmit}>
                <InputWrapper
                  id="ssid"
                  required
                  label="Navn på wifi"
                  style={{ marginBottom: 16 }}
                >
                  <Input
                    id="ssid"
                    name="ssid"
                    defaultValue={wifiSettings.ssid}
                  />
                </InputWrapper>
                <InputWrapper
                  id="ssid"
                  required
                  label="Passordet for wifi"
                  style={{ marginBottom: 16 }}
                >
                  <Input id="psk" name="psk" defaultValue={wifiSettings.psk} />
                </InputWrapper>
                <Button type="submit">Oppdater</Button>
              </form>
            )}
          </Group>
          <Divider />
          <Group style={{ padding: '16px 0' }}>
            <Button
              size="xs"
              variant="light"
              onClick={() => send({ action: 'firmware-update' })}
            >
              Oppdater fastvare
            </Button>
          </Group>
        </div>
      )}
    </Container>
  );
}
