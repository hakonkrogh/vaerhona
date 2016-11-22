import fs from 'fs';

import Express from 'express';
import helmet from 'helmet';
//import session = from 'express-session';
import compression from 'compression';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import path from 'path';
import IntlWrapper from '../client/modules/Intl/IntlWrapper';

// Webpack Requirements
import webpack from 'webpack';
import config from '../webpack.config.dev';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

// Initialize the Express App
const app = new Express();

// Run Webpack dev server in development mode
if (process.env.NODE_ENV === 'development') {
  const compiler = webpack(config);
  app.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: config.output.publicPath }));
  app.use(webpackHotMiddleware(compiler));
}

// Ensure extra response headers
app.use(helmet());

// React And Redux Setup
import { configureStore } from '../client/store';
import { Provider } from 'react-redux';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { match, RouterContext } from 'react-router';
import Helmet from 'react-helmet';

// Import required modules
import routes from '../client/routes';
import { fetchComponentData } from './util/fetchData';
import snapshots from './routes/snapshot.routes';
import places from './routes/place.routes';
import dummyData from './dummyData';
import serverConfig from './config';

// Define the app specific config
const APP_CONFIG = {};
APP_CONFIG.imageUrlBase = serverConfig.imageUrlBase;

// MongoDB Connection
mongoose.connect(serverConfig.mongoURL, error => {
  if (error) {
    console.error('Please make sure Mongodb is installed and running!'); // eslint-disable-line no-console
    throw error;
  }

  // feed some dummy data in DB.
  if (process.env.NODE_ENV === 'development') {
    dummyData();
  }
});

// Apply body Parser and server public assets and routes
app.use(compression());
app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }));

const maxAge = 60 * 60 * 24 * 365 * 1000;

app.use(Express.static(path.resolve(__dirname, '../dist'), { maxAge }));
app.use('/static', Express.static(path.resolve(__dirname, '../static'), { maxAge }));

app.use('/api', snapshots);
app.use('/api', places);

// Render Initial HTML
const renderFullPage = (html, initialState) => {
  return new Promise((resolve, reject) => {
    const head = Helmet.rewind();

    // Import Manifests
    const assetsManifest = process.env.webpackAssets && JSON.parse(process.env.webpackAssets);
    const chunkManifest = process.env.webpackChunkAssets && JSON.parse(process.env.webpackChunkAssets);

    if (process.env.NODE_ENV === 'production') {
      fs.readFile(path.resolve(__dirname, '../dist' + assetsManifest['/app.css']), 'utf-8', (err, content) => {
        if (err) {
          reject(err);
        } else {
          resolveWithResponse({ appCSS: content });
        }
      });
    } else {
      resolveWithResponse({});
    }

    function resolveWithResponse ({ appCSS }) {
      resolve(`
        <!doctype html>
        <html>
          <head>
            ${head.base.toString()}
            ${head.title.toString()}
            ${head.meta.toString()}
            ${head.link.toString()}
            ${head.script.toString()}

            <script>window.__APP_CONFIG__ = ${JSON.stringify(APP_CONFIG)}</script>

            ${process.env.NODE_ENV === 'production' ? `<style>${appCSS}</style>` : ''}

            <link rel="apple-touch-icon" sizes="180x180" href="/static/favicons/apple-touch-icon.png?v=5A5637bzNY">
            <link rel="icon" type="image/png" href="/static/favicons/favicon-32x32.png?v=5A5637bzNY" sizes="32x32">
            <link rel="icon" type="image/png" href="/static/favicons/favicon-16x16.png?v=5A5637bzNY" sizes="16x16">
            <link rel="manifest" href="/static/favicons/manifest.json?v=5A5637bzNY">
            <link rel="mask-icon" href="/static/favicons/safari-pinned-tab.svg?v=5A5637bzNY" color="#00628b">
            <link rel="shortcut icon" href="/static/favicons/favicon.ico?v=5A5637bzNY">
            <meta name="msapplication-TileColor" content="#00628b">
            <meta name="msapplication-TileImage" content="/static/favicons/mstile-144x144.png?v=5A5637bzNY">
            <meta name="msapplication-config" content="/static/favicons/browserconfig.xml?v=5A5637bzNY">
            <meta name="theme-color" content="#ffffff">
            <meta name="apple-mobile-web-app-capable" content="yes" />
          </head>
          <body>
            <div id="root">${process.env.NODE_ENV === 'production' ? html : `<div>${html}</div>`}</div>
            <script>
              window.__INITIAL_STATE__ = ${JSON.stringify(initialState)};
              window.__NODE_ENV = '${process.env.NODE_ENV}';
              ${process.env.NODE_ENV === 'production' ?
              `//<![CDATA[
              window.webpackManifest = ${JSON.stringify(chunkManifest)};
              //]]>` : ''}
            </script>
            <script src='${process.env.NODE_ENV === 'production' ? assetsManifest['/vendor.js'] : '/vendor.js'}'></script>
            <script async defer src='${process.env.NODE_ENV === 'production' ? assetsManifest['/app.js'] : '/app.js'}'></script>
            <script async defer src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.2.2/Chart.min.js" integrity="sha256-fQOizuxGMT1DCcF0rU6EK8zQM6TwsSWGTHjL5UpxLlU=" crossorigin="anonymous"></script>
          </body>
        </html>
      `);
    }
  });
};

const renderError = err => {
  const softTab = '&#32;&#32;&#32;&#32;';
  const errTrace = process.env.NODE_ENV !== 'production' ?
    `:<br><br><pre style="color:red">${softTab}${err.stack.replace(/\n/g, `<br>${softTab}`)}</pre>` : '';
  return renderFullPage(`Server Error${errTrace}`, {});
};

// Basic session
/*app.use(session({  
  secret: 'mySecretCookieSalt',
  key: 'myCookieSessionId', 
  cookie: {
    httpOnly: true,
    secure: true,
    domain: 'example.com',
    path: '/foo/bar',
    // Cookie will expire in 1 hour from when it's generated 
    expires: new Date( Date.now() + 60 * 60 * 1000 )
  }
}));*/

// Server Side Rendering based on routes matched by React-router.
app.use((req, res, next) => {
  match({ routes, location: req.url }, (err, redirectLocation, renderProps) => {
    if (err) {
      return res.status(500).end(renderError(err));
    }

    if (redirectLocation) {
      return res.redirect(302, redirectLocation.pathname + redirectLocation.search);
    }

    if (!renderProps) {
      return next();
    }

    const store = configureStore();

    return fetchComponentData(store, renderProps.components, renderProps.params)
      .then(() => {
        const initialView = renderToString(
          <Provider store={store}>
            <IntlWrapper>
              <RouterContext {...renderProps} />
            </IntlWrapper>
          </Provider>
        );
        const finalState = store.getState();

        renderFullPage(initialView, finalState)
        .then(page => {
          res
          .set('Content-Type', 'text/html')
          .status(200)
          .end(page);
        })
      })
      .catch((error) => next(error));
  });
});

// start app
app.listen(serverConfig.port, (error) => {
  if (!error) {
    console.log(`Værhøna is running on port: ${serverConfig.port}!`); // eslint-disable-line
  }
});

export default app;