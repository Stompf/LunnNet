import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
// import App from './App';
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import { HashRouter, Switch, Link, Route } from 'react-router-dom';

const PlayerAPI = {
  players: [
    { number: 1, name: 'Ben Blocker', position: 'G' },
    { number: 2, name: 'Dave Defender', position: 'D' },
    { number: 3, name: 'Sam Sweeper', position: 'D' },
    { number: 4, name: 'Matt Midfielder', position: 'M' },
    { number: 5, name: 'William Winger', position: 'M' },
    { number: 6, name: 'Fillipe Forward', position: 'F' }
  ],
  all: function () { return this.players; },
  get: function (id: {}) {
    return this.players.find(p => p.number === id);
  }
};

// The FullRoster iterates over all of the players and creates
// a link to their profile page.
const FullRoster = () => (
  <div>
    <ul>
      {
        PlayerAPI.all().map(p => (
          <li key={p.number}>
            <Link to={`/roster/${p.number}`}>{p.name}</Link>
          </li>
        ))
      }
    </ul>
  </div>
);

// The Player looks up the player using the number parsed from
// the URL's pathname. If no player is found with the given
// number, then a "player not found" message is displayed.
const Player = (props: any) => {
  const player = PlayerAPI.get(
    parseInt(props.match.params.number, 10)
  );
  if (!player) {
    return <div>Sorry, but the player was not found</div>;
  }
  return (
    <div>
      <h1>{player.name} (#{player.number})</h1>
      <h2>Position: {player.position}</h2>
      <Link to="/roster">Back</Link>
    </div>
  );
};

// The Roster component matches one of two different routes
// depending on the full pathname
const Roster = () => (
  <Switch>
    <Route exact={true} path="/roster" component={FullRoster} />
    <Route path="/roster/:number" component={Player} />
  </Switch>
);

const Schedule = () => (
  <div>
    <ul>
      <li>6/5 @ Evergreens</li>
      <li>6/8 vs Kickers</li>
      <li>6/14 @ United</li>
    </ul>
  </div>
);

const Home = () => (
  <div>
    <h1>Welcome to the Tornadoes Website!</h1>
  </div>
);
const Header = () => (
  <header>
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/roster">Roster</Link></li>
        <li><Link to="/schedule">Schedule</Link></li>
      </ul>
    </nav>
  </header>
);

const Main = () => (
  <main>
    <Switch>
      <Route exact={true} path="/" component={Home} />
      <Route path="/roster" component={Roster} />
      <Route path="/schedule" component={Schedule} />
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
