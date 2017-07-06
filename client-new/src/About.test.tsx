import * as React from 'react';
import * as ReactDOM from 'react-dom';
import 'react-router-dom';
import About from './About';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<About />, div);
});
