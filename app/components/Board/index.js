import React, { Component } from 'react';
import Header from '../../components/Header';
import Nav from '../../components/Nav';
import Canvas from '../../components/Canvas';

class Board extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tool: 'bruse',
    }
  }

  handleEraser(e, context) {
    context.setState({ tool: e.target.dataset.info })
  }
  render() {
    return (
      <div>
        <Header>
          <Nav>
            <ul>
              <li><button onClick={e => this.handleEraser(e, this)} data-info="bruse">Bruse</button></li>
              <li><button onClick={e => this.handleEraser(e, this)} data-info="eraser">Eraser</button></li>
            </ul>
          </Nav>
        </Header>
        <Canvas tool={this.state.tool}/>
      </div>
    );
  }
}

export default Board;
