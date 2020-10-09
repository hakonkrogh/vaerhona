import Document, { Html, Head, Main, NextScript } from 'next/document';
import { ServerStyleSheet } from 'styled-components';

export default class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) =>
            sheet.collectStyles(<App {...props} />),
        });

      const initialProps = await Document.getInitialProps(ctx);
      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
      };
    } finally {
      sheet.seal();
    }
  }

  render() {
    return (
      <Html lang="no">
        <Head>
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/static/favicons/apple-touch-icon.png?v=M4yo99lAWP"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/static/favicons/favicon-32x32.png?v=M4yo99lAWP"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/static/favicons/favicon-16x16.png?v=M4yo99lAWP"
          />
          <link
            rel="manifest"
            href="/static/favicons/manifest.json?v=M4yo99lAWP"
          />
          <link
            rel="mask-icon"
            href="/static/favicons/safari-pinned-tab.svg?v=M4yo99lAWP"
            color="#5bbad5"
          />
          <link
            rel="shortcut icon"
            href="/static/favicons/favicon.ico?v=M4yo99lAWP"
          />
          <meta
            name="msapplication-config"
            content="/static/favicons/browserconfig.xml?v=M4yo99lAWP"
          />
          <meta name="theme-color" content="#ffffff" />

          <script
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer = [{ environment: '${process.env.NODE_ENV}' }];`,
            }}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-PX3JG5J');`,
            }}
          />
          <link
            href="https://fonts.googleapis.com/css?family=Montserrat&amp;display=swap"
            rel="stylesheet"
          />
        </Head>
        <body style={{ margin: 0, fontFamily: `'Montserrat', sans-serif` }}>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
