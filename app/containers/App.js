import React, { Component } from 'react';
import Header from '../components/Header';
import Nav from '../components/Nav';
import Canvas from '../components/Canvas';

class App extends Component {
  render() {
    return (
      <div>
        <Header>
          <Nav>
            <ul>
              <li>Icon</li>
              <li>Icon</li>
            </ul>
          </Nav>
        </Header>
        <Canvas />
      </div>
    );
  }
}

export default App;
