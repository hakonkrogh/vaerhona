import Document, { Head, Main, NextScript } from 'next/document';
import { ServerStyleSheet } from 'styled-components';

import serverConfig from '../server/config';

export default class MyDocument extends Document {
  render () {
    const sheet = new ServerStyleSheet();
    const main = sheet.collectStyles(<Main />);
    const styleTags = sheet.getStyleElement();

    return (
      <html lang='no'>
        <Head>
          <title>Værhøna.no</title>
          <meta name="viewport" content="width=device-width, initial-scale=1, minimal-ui" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <link rel="apple-touch-icon" sizes="180x180" href="/static/favicons/apple-touch-icon.png?v=M4yo99lAWP" />
          <link rel="icon" type="image/png" sizes="32x32" href="/static/favicons/favicon-32x32.png?v=M4yo99lAWP" />
          <link rel="icon" type="image/png" sizes="16x16" href="/static/favicons/favicon-16x16.png?v=M4yo99lAWP" />
          <link rel="manifest" href="/static/favicons/manifest.json?v=M4yo99lAWP" />
          <link rel="mask-icon" href="/static/favicons/safari-pinned-tab.svg?v=M4yo99lAWP" color="#5bbad5" />
          <link rel="shortcut icon" href="/static/favicons/favicon.ico?v=M4yo99lAWP" />
          <meta name="msapplication-config" content="/static/favicons/browserconfig.xml?v=M4yo99lAWP" />
          <meta name="theme-color" content="#ffffff" />
          {styleTags}
        </Head>
        <body style={{ margin: 0 }}>
          <div className='root'>
            {main}
          </div>
          <NextScript />
        </body>
      </html>
    )
  }
}
