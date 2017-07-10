import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import { HashRouter, Switch, Link, Route } from 'react-router-dom';

import About from './About';
import Asteroids from './asteroids/Asteroids';
import Car from './car/Car';

const Header = () => (
  <header>
    <nav>
      <span><Link to="/">Home</Link></span> |
      <span><Link to="/asteroids"> Asteroids</Link></span> |
      <span><Link to="/car"> Car</Link></span> |
    </nav>
  </header>
);

const Main = () => (
  <main>
    <Switch>
      <Route exact={true} path="/" component={About as any} />
      <Route path="/asteroids" component={Asteroids as any} />
      <Route path="/car" component={Car as any} />
    </Switch>
  </main>
);

const App = () => (
  <div>
    <Header />
    <Main />
  </div>
);

ReactDOM.render(
  <HashRouter>
    <App />
  </HashRouter>,
  document.getElementById('root') as HTMLElement
);

registerServiceWorker();
