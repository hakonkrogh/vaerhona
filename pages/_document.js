import Document, { Head, Main, NextScript } from 'next/document';
import { ServerStyleSheet } from 'styled-components';

import serverConfig from '../server/config';

const appConfig = {
  apiUri: serverConfig.apiUri
};

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
          <script dangerouslySetInnerHTML={{ __html : `window.__APP_CONFIG__ = ${JSON.stringify(appConfig)};` }}></script>
          <NextScript />
        </body>
      </html>
    )
  }
}
