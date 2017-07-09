import Document, { Head, Main, NextScript } from 'next/document';
import { ServerStyleSheet } from 'styled-components';

import serverConfig from '../server/config';

// Define the app specific config
const APP_CONFIG = {};
APP_CONFIG.imageUrlBase = serverConfig.imageUrlBase;

export default class MyDocument extends Document {
  render () {
    const sheet = new ServerStyleSheet();
    const main = sheet.collectStyles(<Main />);
    const styleTags = sheet.getStyleElement();

    return (
      <html>
        <Head>
          <title>My page</title>
          {styleTags}
        </Head>
        <body style={{ margin: 0 }}>
          <div className='root'>
            {main}
          </div>
          <script>window.__APP_CONFIG__ = ${JSON.stringify(APP_CONFIG)}</script>
          <NextScript />
        </body>
      </html>
    )
  }
}
