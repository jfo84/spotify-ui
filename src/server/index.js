'use strict';

/** Module dependencies. */
require('dotenv').config();


const express      = require('express');
const bodyParser   = require('body-parser');
const cookieParser = require('cookie-parser');
const path         = require('path');
const logger       = require('morgan');
const cors         = require('cors');
const sourceMapSupport = require('source-map-support');

const ReactRouter = require('react-router');
const React = require('react');
const App = require('../shared/App');
const NoMatch = require('../shared/NoMatch');
const Error = require('../shared/Error');

const routes       = require('./routes');
const render       = require('./render');

const port = process.env.PORT || 3000;

sourceMapSupport.install();

// Configure the express server
const app = express();

if (process.env.NODE_ENV === 'production') {
  // In production we want to serve our JavaScripts from a file on the file
  // system.
  app.use('/static', express.static(path.join(process.cwd(), 'build/client/static')));
} else {
  // Otherwise we want to proxy the webpack development server.
  app.use(['/static','/sockjs-node'], proxy({
    target: `http://localhost:${process.env.REACT_APP_CLIENT_PORT}`,
    ws: true,
    logLevel: 'error'
  }));
}

app.set('port', port);
app.use(logger('dev'))
  .use(cors())
  .use(cookieParser())
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: false }))
  .use('/', express.static('build/client'))
  .use('/', routes);

app.get('*', (req, res) => {
    res.status(200).send(render(
      <ReactRouter.StaticRouter context={{}} location={req.url}>
          <App/>
      </ReactRouter.StaticRouter>
    ));
});

app.listen(3000, () => console.log('App listening on port 3000'));