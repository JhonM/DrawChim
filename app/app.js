import React from 'react';
import { render } from 'react-dom';
import App from './containers/App.js';

const root = document.getElementById('app');
root ? render(<App />, root) : false;
