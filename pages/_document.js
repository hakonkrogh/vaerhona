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
          <title>Værhøna</title>
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

          <script dangerouslySetInnerHTML={{ __html: `window.dataLayer = [{ environment: '${serverConfig.environment}' }];` }} />
          <script dangerouslySetInnerHTML={{ __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-PX3JG5J');` }} />

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
