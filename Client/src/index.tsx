import 'bootstrap/dist/css/bootstrap.css';
import './index.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { unregister } from './registerServiceWorker';
import { HashRouter, Switch, Link, Route } from 'react-router-dom';
import Asteroids from './asteroids/asteroids';
import AirHockey from './air-hockey/air-hockey';

(window as any).PIXI = require('phaser-ce/build/custom/pixi');
(window as any).p2 = require('phaser-ce/build/custom/p2');
(window as any).Phaser = require('phaser-ce/build/custom/phaser-split');

const Header = () => (
    <header>
        <nav>
            <span>
                <Link to="/">Air hockey</Link>
            </span>{' '}
            |
            <span>
                {' '}
                <Link to="/asteroids">Asteroids</Link>
            </span>{' '}
        </nav>
    </header>
);

const Main = () => (
    <main>
        <Switch>
            <Route exact={true} path="/" component={AirHockey} />
            <Route path="/asteroids" component={Asteroids} />
            <Route path="/physics-network" component={AirHockey} />
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

// Unregister the service worker
unregister();
