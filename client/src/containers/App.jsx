import React from 'react';
import { Component } from 'react';
import { Router, Route, IndexRedirect, browserHistory } from 'react-router';
import Library from '../components/Library';
import Dataset from './Dataset';
import Visualisations from '../components/Visualisations';
import Dashboards from '../components/Dashboards';
import Main from '../components/Main';

class App extends Component {
  render() {
    return (
      <Router history={browserHistory}>
        <Route path="/" component={Main}>
          <IndexRedirect from="" to="library"/>
          <Route path="library" component={Library}/>
          <Route path="library/:collection" component={Library}/>
          <Route path="dataset/:datasetId" component={Dataset}/>
          <Route path="visualisations" component={Visualisations}/>
          <Route path="dashboards" component={Dashboards}/>
        </Route>
      </Router>
    );
  }
}

export default App;
