import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { StaticRouter } from 'react';

import { SheetsRegistry } from 'react-jss/lib/jss';
import JssProvider from 'react-jss/lib/JssProvider';
import { MuiThemeProvider, createMuiTheme, createGenerateClassName } from 'material-ui/styles';
import blue from 'material-ui/colors/blue';
import grey from 'material-ui/colors/grey';

import sourceMapSupport from 'source-map-support';
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import path from 'path';
import logger from 'morgan';
import cors from 'cors';
import proxy from 'http-proxy-middleware';

import routes from './routes';
import render from './render';

import App from '../shared/App';
import reducer from '../shared/reducers/app';

const store = createStore(reducer.default);
const preloadedState = store.getState();

const sheetsRegistry = new SheetsRegistry();
const theme = createMuiTheme({
  palette: {
    primary: blue,
    accent: grey,
    type: 'light'
  }
});
const generateClassName = createGenerateClassName();
const css = sheetsRegistry.toString()

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
    <Provider store={store}>
      <JssProvider registry={sheetsRegistry} generateClassName={generateClassName}>
        <MuiThemeProvider theme={theme} sheetsManager={new Map()}>
          <StaticRouter context={{}} location={req.url}>
            <App/>
          </StaticRouter>
        </MuiThemeProvider>
      </JssProvider>
    </Provider>,
    preloadedState,
    css
  ));
});

app.listen(3000, () => console.log('App listening on port 3000'));