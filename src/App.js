import './App.css';
import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

// BOOTSTRAP
import 'bootstrap/dist/css/bootstrap.min.css';


import { ContinueSequence } from './components/ContinueSequence';

function App() {
      return (
      <Router>
        <div>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/continue">Continue sequence</Link>
            </li>
          </ul>
  
          <hr />
          <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route path="/continue">
            <ContinueSequence />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

function Home() {
  return (
    <div>
      <h2>Home</h2>
    </div>
  );
}


export default App;
