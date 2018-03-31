import 'typeface-roboto';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { unregister } from './registerServiceWorker';
import { HashRouter, Switch, Link, Route } from 'react-router-dom';
import Asteroids from './asteroids/asteroids';
import AirHockey from './air-hockey/air-hockey-main-menu';
import AirHockeyLocal from './air-hockey/air-hockey-local';
import AirHockeyNetwork from './air-hockey/air-hockey-network';
import Isometric from './isometric/isometric';

import { Reboot, AppBar, Button, Grid } from 'material-ui';

(window as any).PIXI = require('phaser-ce/build/custom/pixi');
(window as any).p2 = require('phaser-ce/build/custom/p2');
(window as any).Phaser = require('phaser-ce/build/custom/phaser-split');

const AsteroidLink = (props: any) => <Link to="/asteroids" {...props} />;
const IsometricLink = (props: any) => <Link to="/isometric" {...props} />;

const Header = () => (
    <AppBar position="static">
        <Grid container spacing={0}>
            <Grid item>
                <AirHockey />
            </Grid>
            <Grid item>
                <Button color="inherit" component={AsteroidLink}>
                    Asteroids
                </Button>
            </Grid>
            <Grid item>
                <Button color="inherit" component={IsometricLink}>
                    Isometric
                </Button>
            </Grid>
        </Grid>
    </AppBar>
);

const Main = () => (
    <main>
        <Switch>
            <Route path="/asteroids" component={Asteroids} />
            <Route path="/physics-network" component={AirHockeyNetwork} />
            <Route path="/air-hockey/local" component={AirHockeyLocal} />
            <Route path="/air-hockey/network" component={AirHockeyNetwork} />
            <Route path="/isometric" component={Isometric} />
            <Route component={AirHockeyLocal} />
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
