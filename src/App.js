import React, { Component } from 'react';
import { connect } from 'react-redux';
import { 
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect
} from 'react-router-dom';

import Main from './components/Main';

const PrivateRoute = ({ component: Component, hasAuthenticated, ...rest }) => (
  <Route {...rest} render={(props) => (
    hasAuthenticated === true
      ? <Component {...props} />
      : <Redirect to='/api/login' />
  )} />
);

class App extends Component {
  render() {
    return(
      <Router>
        <div>
          <Switch>
            <PrivateRoute exact path='/' component={Main} hasAuthenticated={this.props.hasAuthenticated} />
          </Switch>
        </div>
      </Router>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    hasAuthenticated: state.hasAuthenticated
  };
};

export default connect(mapStateToProps, null)(App);