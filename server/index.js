require('dotenv').config();

if (!process.env.API_URI) {
  console.error('Cannot start. Missing process.env.API_URI');
  return;
}

const express = require('express');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const api = require('../isomorphic/api');
const apiRoutes = require('./api-routes');
const services = require('./services');

services.populateInitialCache()
  .then(() => app.prepare())
  .then(() => {
    const server = express();

    server.use('/api', apiRoutes);

    server.get('*', (req, res) => {
      const { url } = req;

      const urlCheck = url.replace(/http(s?):\/\/[^\/]*/, '');
      if (urlCheck[0] !== '/') {
          urlCheck = '/' + urlCheck;
      }

      if (urlCheck.startsWith('/_next')) return handle(req, res);
      if (urlCheck.startsWith('/static')) return handle(req, res);
      if (urlCheck.startsWith('/favico')) return handle(req, res);

      api.getRouteComponentAndMetadata(req.url)
        .then(({ match, componentName, query }) => {
          if (match) {
            // Render our matched route
            return app.render(req, res, '/' + componentName, query);
          } else {
            // Defer to the Next framework handler
            return handle(req, res);
          }
        });
    });

    server.listen(process.env.APP_PORT, (err) => {
      if (err) throw err
      console.log('> Ready on http://localhost:' + process.env.APP_PORT)
    });
  });