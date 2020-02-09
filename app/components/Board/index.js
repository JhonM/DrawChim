import React, { Component } from 'react';
import Header from '../../components/Header';
import Nav from '../../components/Nav';
import Canvas from '../../components/Canvas';

class Board extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tool: 'brush',
      color: '#000000',
      lineWidth: 5,
    };
  }

  handleEraser(e, context) {
    context.setState({ tool: e.target.dataset.info });
  }

  handleChange(type, e, context) {
    context.setState({ [type]: e.target.value });
  }

  handleUndo() {
    debugger;
  }
  render() {
    return (
      <div>
        <Header>
          <Nav>
            <ul>
              <li>
                <button
                  onClick={e => this.handleEraser(e, this)}
                  data-info="brush"
                >
                  Brush
                </button>
              </li>
              <li>
                <button
                  onClick={e => this.handleEraser(e, this)}
                  data-info="eraser"
                >
                  Eraser
                </button>
              </li>
              <li>
                <label>
                  <big>color: </big>
                  <input
                    name="color"
                    type="color"
                    onChange={e => this.handleChange('color', e, this)}
                    value={this.state.color}
                  />
                </label>
              </li>
              <li>
                <label>
                  <big>Line width</big>
                  <input
                    type="range"
                    name="lineWidth"
                    min="1"
                    max="80"
                    onChange={e => this.handleChange('lineWidth', e, this)}
                    id=""
                  />
                </label>
              </li>
            </ul>
          </Nav>
        </Header>
        <Canvas
          tool={this.state.tool}
          color={this.state.color}
          lineWidth={this.state.lineWidth}
        />
      </div>
    );
  }
}

export default Board;
