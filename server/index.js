const express = require('express');
const next = require('next');
const apiRoutes = require('./routes');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const api = require('../api');

app.prepare()
.then(() => {
  const server = express();

  server.use('/api', apiRoutes);

  server.get('*', (req, res) => {
    return new Promise((resolve) => {
      api.getRouteComponentAndMetadata(req.url)
        .then(({ match, componentName, query }) => {
          if (match) {
            // Render our matched route
            return app.render(req, res, '/' + componentName, query);
          } else {
            // Defer to the Next framework handler
            return handle(req, res);
          }
        })
    });
  });

  server.listen(process.env.APP_PORT, (err) => {
    if (err) throw err
    console.log('> Ready on http://localhost:' + process.env.APP_PORT)
  });
});
