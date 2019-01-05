import React, { Component } from "react";
import ReactDOM from "react-dom";
import App from './containers/App.js';

const root = document.getElementById("app");
root ? ReactDOM.render(<App />, root) : false;
