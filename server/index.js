require('dotenv').config();

if (!process.env.API_URI) {
  console.error('Cannot start. Missing process.env.API_URI');
  return;
}

const express = require('express');
const next = require('next');
const pathMatch = require('path-match');
const { parse } = require('url');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const apiRoutes = require('./api-routes');
const startApollo = require('./apollo');

const route = pathMatch();
const placeMatch = route('/place/:placeName');

app.prepare().then(() => {
  const server = express();

  startApollo(server);

  server.use('/api', apiRoutes);

  server.get('*', async (req, res) => {
    const { pathname, query } = parse(req.url, true);

    const params = placeMatch(pathname);
    if (params === false) {
      handle(req, res);
      return;
    }

    app.render(req, res, '/place', Object.assign(params, query));
  });

  server.listen(process.env.APP_PORT, err => {
    if (err) throw err;
    console.log('> Ready on http://localhost:' + process.env.APP_PORT);
  });
});
