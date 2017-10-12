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
import AirHockey from './airHockey/AirHockey';

import i18next from 'i18next';

const Header = () => (
  <header>
    <nav>
      <span><Link to="/">Home</Link></span> |
      <span><Link to="/asteroids"> {i18next.t('key')}</Link></span> |
      <span><Link to="/car"> Car</Link></span> |
      <span><Link to="/airHockey"> AirHockey</Link></span> |
    </nav>
  </header>
);

const Main = () => (
  <main>
    <Switch>
      <Route exact={true} path="/" component={About as any} />
      <Route path="/asteroids" component={Asteroids as any} />
      <Route path="/car" component={Car as any} />+
      <Route path="/airHockey" component={AirHockey as any} />
    </Switch>
  </main>
);

const App = () => (
  <div>
    <div onClick={changeLang}>CHANGE LANG</div>
    <Header />
    <Main />
  </div>
);

function changeLang() {
  i18next.changeLanguage(i18next.language === 'en' ? 'de' : 'en');

}

i18next.init({
  lng: 'en',
  debug: true,
  resources: {
    en: {
      translation: {
        'key': 'hello world'
      }
    },
    de: {
      translation: {
        'key': 'hello welt'
      }
    }
  }
}, function (err, t) {
  // init set content
  renderDOM();
});

i18next.on('languageChanged', () => {
  renderDOM();
});

function renderDOM() {
  ReactDOM.render(
    <HashRouter>
      <App />
    </HashRouter>,
    document.getElementById('root') as HTMLElement
  );
}

registerServiceWorker();
