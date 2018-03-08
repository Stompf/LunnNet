import 'typeface-roboto';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { unregister } from './registerServiceWorker';
import { HashRouter, Switch, Link, Route } from 'react-router-dom';
import Asteroids from './asteroids/asteroids';
import AirHockey from './air-hockey/air-hockey-main-menu';
import AirHockeyLocal from './air-hockey/air-hockey-local';
import AirHockeyNetwork from './air-hockey/air-hockey-network';
import { Reboot, AppBar, Button } from 'material-ui';

(window as any).PIXI = require('phaser-ce/build/custom/pixi');
(window as any).p2 = require('phaser-ce/build/custom/p2');
(window as any).Phaser = require('phaser-ce/build/custom/phaser-split');

const AirHockeyLink = (props: any) => <Link to="/" {...props} />;
const AsteroidLink = (props: any) => <Link to="/asteroids" {...props} />;

const Header = () => (
    <AppBar position="static">
        <div>
            <Button component={AirHockeyLink}>Air hockey</Button>
            <Button component={AsteroidLink}>Asteroids</Button>
        </div>
    </AppBar>
);

const Main = () => (
    <main>
        <Switch>
            <Route exact={true} path="/" component={AirHockey} />
            <Route path="/asteroids" component={Asteroids} />
            <Route path="/physics-network" component={AirHockey} />
            <Route path="/air-hockey/local" component={AirHockeyLocal} />
            <Route path="/air-hockey/network" component={AirHockeyNetwork} />
        </Switch>
    </main>
);

const App = () => (
    <div>
        <Reboot />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
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
