import 'bootstrap/dist/css/bootstrap.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import { HashRouter, Switch, Link, Route } from 'react-router-dom';
import Asteroids from './asteroids/asteroids';
import PhysicsNetwork from './physics-network/physics-network';
import AirHockey from './air-hockey/air-hockey';

(window as any).PIXI = require('phaser-ce/build/custom/pixi');
(window as any).p2 = require('phaser-ce/build/custom/p2');
(window as any).Phaser = require('phaser-ce/build/custom/phaser-split');

const Header = () => (
    <header>
        <nav>
            <span>
                <Link to="/">AirHockey</Link>
            </span>{' '}
            |
            <span>
                {' '}
                <Link to="/asteroids">Asteroids</Link>
            </span>{' '}
            |
            <span>
                {' '}
                <Link to="/physics-network">Physics network</Link>
            </span>
        </nav>
    </header>
);

const Main = () => (
    <main>
        <Switch>
            <Route exact={true} path="/" component={AirHockey} />
            <Route path="/asteroids" component={Asteroids} />
            <Route path="/physics-network" component={PhysicsNetwork} />
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

// registerServiceWorker();
