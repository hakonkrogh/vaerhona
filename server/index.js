require('dotenv').config();

const express = require('express');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const api = require('../isomorphic/api');
const apiRoutes = require('./api-routes');

app.prepare()
.then(() => {
  const server = express();

  server.use('/api', apiRoutes);

  server.get('*', (req, res) => {
    if (req.url.startsWith('/_next')) {
      return handle(req, res);
    }
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
