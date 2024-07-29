import { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  Button,
  Container,
  Divider,
  Group,
  InputWrapper,
  Input,
} from '@mantine/core';

import { Temperature, Humidity } from 'ui';

const IsOnline = styled.div`
  margin-left: 15px;
`;

const BoxId = styled.div`
  font-size: 0.7rem;
  font-style: italic;
  opacity: 0.6;
  margin: 15px 0;

  &::before {
    content: 'Box id: ';
  }
`;

const BlockingMessage = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  width: 100%;
  height: 100%;
  background: #ffffffdd;
  padding: 10%;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2rem;
`;

const primaryServiceUuid = '601202ac-16d1-4f74-819d-85788a5ad77a';

const txtD = new TextDecoder('utf-8');
const txtE = new TextEncoder('utf-8');

let device, server, service, firstCharacteristic;

export default function Setup() {
  const [isConnected, setIsConnected] = useState(false);
  const [sensorValues, setSensorValues] = useState(null);

  const [wifiSettings, setWifiSettings] = useState([]);
  const [supportsMultipleWifi, setSupportsMultipleWifi] = useState(false);

  const [isOnline, setIsOnline] = useState(null);
  const [boxId, setBoxId] = useState(null);
  const [blockingMessage, setBlockingMessage] = useState(false);
  const [changeWifi, setChangeWifi] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return '...';
  }

  function onDisconnected() {
    device = null;
    server = null;
    service = null;
    firstCharacteristic = null;
    setIsConnected(false);
    setChangeWifi(false);
    setBlockingMessage(false);
    alert('device disconnected');
  }

  async function connect() {
    device = await navigator.bluetooth.requestDevice({
      // acceptAllDevices: true,
      optionalServices: [primaryServiceUuid],
      filters: [{ name: 'Vaerhona' }, { name: 'raspberrypi' }],
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
          case 'box-id': {
            console.log(value);
            setBoxId(value.data);
            break;
          }
          case 'wifi-settings': {
            console.log(value);
            const doesMultipleWifi = Array.isArray(value.data);
            setWifiSettings(doesMultipleWifi ? value.data : [value.data]);
            setSupportsMultipleWifi(doesMultipleWifi);

            break;
          }
          case 'is-online': {
            console.log(value);
            setIsOnline(value.data);
            break;
          }
        }
      } catch (e) {
        console.log(e);
      }
    };

    setIsConnected(true);

    send({
      action: 'get-online',
    });

    device.ongattserverdisconnected = onDisconnected;
  }

  function send(message) {
    firstCharacteristic.writeValue(txtE.encode(JSON.stringify(message)));

    let msg = '';
    let willRebootOrShutdown = false;
    switch (message.action) {
      case 'set-wifi': {
        msg = 'Oppdaterer Wifi...';
        willRebootOrShutdown = true;
        break;
      }
      case 'take-snapshot': {
        msg = 'Tar et bilde. Vennligst vent...';
        break;
      }
      case 'os-update': {
        msg = 'Oppdaterer OS. Dette kan ta flere minutter. Vennligst vent...';
        willRebootOrShutdown = true;
        break;
      }
      case 'firmware-update': {
        msg =
          'Oppdaterer fastvare. Dette kan ta flere minutter. Vennligst vent...';
        willRebootOrShutdown = true;
        break;
      }
      case 'reboot': {
        msg = 'Starter på nytt. Vennligst vent...';
        willRebootOrShutdown = true;
        break;
      }
      case 'shutdown': {
        msg = 'Skrur av. Vennligst vent...';
        willRebootOrShutdown = true;
        break;
      }
    }

    if (msg) {
      setBlockingMessage(msg);

      if (!willRebootOrShutdown) {
        setTimeout(() => setBlockingMessage(null), 5000);
      }
    }
  }

  function onWifiSettingsUpdateSubmit(e) {
    e.preventDefault();
    const vals = Object.fromEntries(new FormData(e.target));
    const newSettings = [];
    for (const key of Object.keys(vals)) {
      const [index, wKey] = key.split(':::::');
      const indx = parseInt(index);
      if (!newSettings[indx]) {
        newSettings[indx] = { ssid: '', psk: '' };
      }
      newSettings[indx][wKey] = vals[key];
    }

    const valToSend = supportsMultipleWifi ? newSettings : newSettings[0];

    send({
      action: 'set-wifi',
      data: valToSend,
    });
  }

  function removeWifi(index) {
    setWifiSettings((s) => {
      s[index].deleted = true;
      return s;
    });
  }

  function addWifi() {
    setWifiSettings((s) => {
      return [
        ...s,
        {
          ssid: '',
          psk: '',
        },
      ];
    });
  }

  return (
    <Container size="sm" suppressHydrationWarning>
      {blockingMessage ? (
        <BlockingMessage>
          <span>{blockingMessage}</span>
        </BlockingMessage>
      ) : null}
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
                  onClick={() => {
                    const id = prompt('Skriv inn box-id (tom for auto)');
                    send({ action: 'regenerate-boxid', id });
                  }}
                >
                  Lag ny box-id
                </Button>

                <Button
                  size="xs"
                  variant="light"
                  onClick={() => send({ action: 'firmware-update' })}
                >
                  Oppdater fastvare
                </Button>

                <Button
                  size="xs"
                  variant="light"
                  onClick={() => send({ action: 'os-update' })}
                >
                  Oppdater OS
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
            style={{ padding: '50px', fontSize: 50 }}
          >
            <Temperature {...sensorValues} />
            <Divider
              orientation="vertical"
              margins="sm"
              style={{ margin: '0 50px' }}
            />
            <Humidity {...sensorValues} />
          </Group>
          <Divider />
          <Group style={{ padding: '16px 0' }}>
            {!changeWifi ? (
              <>
                <Button variant="light" onClick={() => setChangeWifi(true)}>
                  Endre wifi
                </Button>
                <IsOnline isOnline={isOnline}>
                  {isOnline === null
                    ? 'Sjekker nettstatus...'
                    : isOnline
                    ? '☑️ Er på nett'
                    : '⚠️ Er IKKE på nett'}
                </IsOnline>
              </>
            ) : (
              <form
                onSubmit={onWifiSettingsUpdateSubmit}
                autoComplete="off"
                style={{ display: 'grid', gap: '10px' }}
              >
                {wifiSettings.map((w, index) => (
                  <div key={index} style={{ opacity: w.deleted ? 0.5 : 1 }}>
                    <InputWrapper
                      required
                      label="Navn på wifi"
                      style={{ marginBottom: 16 }}
                    >
                      <Input name={`${index}:::::ssid`} defaultValue={w.ssid} />
                    </InputWrapper>
                    <InputWrapper
                      required
                      label="Passordet for wifi"
                      style={{ marginBottom: 16 }}
                    >
                      <Input name={`${index}:::::psk`} defaultValue={w.psk} />
                    </InputWrapper>
                    {supportsMultipleWifi &&
                      wifiSettings.filter((s) => !s.deleted).length > 1 && (
                        <button type="button" onClick={() => removeWifi(index)}>
                          -
                        </button>
                      )}
                  </div>
                ))}

                {supportsMultipleWifi && (
                  <button type="button" onClick={() => addWifi()}>
                    +
                  </button>
                )}

                <Button type="submit">Oppdater</Button>
              </form>
            )}
          </Group>
          {boxId && <BoxId>{boxId}</BoxId>}
        </div>
      )}
    </Container>
  );
}
