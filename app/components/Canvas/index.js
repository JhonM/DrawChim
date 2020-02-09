import React, { Component } from 'react';
import { Stage, Layer, Image } from 'react-konva';
import PropTypes from 'prop-types';
import Line from './Line';
import Tool from './Tools';

class Canvas extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isDrawing: false,
      mode: 'brush',
      color: '#000000',
      lineWidth: 5,
    };

    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
  }

  _initTools(canvas) {
    this._tools = {};
    this._tools[Tool.Line] = new Line(canvas);
  }

  componentDidMount() {
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    this._initTools(canvas);
    let selectedTool = this._tools['line']; // hardcode for now
    selectedTool.configureCanvas(this.props);
    this._selectedTool = selectedTool;

    this.setState({ canvas });
    this.setState({ mode: this.props.tool });
  }

  componentDidUpdate() {
    this._selectedTool.configureCanvas(this.props);
  }

  handleMouseDown(e) {
    const parent = this.image.parent.parent;
    this._selectedTool.onMouseDown(e, parent);
  }

  handleMouseUp(e) {
    this._selectedTool.onMouseUp(e);
  }

  handleMouseMove(e) {
    const image = this.image;
    this._selectedTool.onMouseMove(e, image);
  }

  undo() {
    debugger;
  }

  render() {
    const { canvas } = this.state;

    return (
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          <Image
            image={canvas}
            ref={node => (this.image = node)}
            width={window.innerWidth}
            height={window.innerHeight}
            stroke="blue"
            onMouseDown={this.handleMouseDown}
            onMouseUp={this.handleMouseUp}
            onMouseMove={this.handleMouseMove}
          />
        </Layer>
      </Stage>
    );
  }
}

Canvas.propTypes = {
  children: PropTypes.string,
};

export default Canvas;
