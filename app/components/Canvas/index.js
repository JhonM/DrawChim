import React, { Component } from 'react';
import { Stage, Layer, Image } from 'react-konva';
import PropTypes from 'prop-types';

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

  componentDidMount() {
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const context = canvas.getContext('2d');

    this.setState({ canvas, context });
    this.setState({ mode: this.props.tool });
  }

  handleMouseDown() {
    this.setState({ isDrawing: true });

    const stage = this.image.parent.parent;
    this.lastPointerPosition = stage.getPointerPosition();
  }

  handleMouseUp() {
    this.setState({ isDrawing: false });
  }

  handleMouseMove() {
    const mode = this.props.tool;
    const { context, isDrawing } = this.state;

    if (isDrawing) {
      // console.log('drawing');

      context.strokeStyle = this.props.color || this.state.color;
      context.lineJoin = 'round';
      context.lineWidth = this.props.lineWidth || this.state.lineWidth;

      if (mode === 'brush') {
        context.globalCompositeOperation = 'source-over';
      } else if (mode === 'eraser') {
        context.globalCompositeOperation = 'destination-out';
      }

      context.beginPath();

      var localPos = {
        x: this.lastPointerPosition.x - this.image.x(),
        y: this.lastPointerPosition.y - this.image.y(),
      };

      // console.log('Move to', localPos);
      context.moveTo(localPos.x, localPos.y);
      // console.log('context', context);

      const stage = this.image.parent.parent;

      var pos = stage.getPointerPosition();
      localPos = {
        x: pos.x - this.image.x(),
        y: pos.y - this.image.y(),
      };

      // console.log('line to', localPos);
      context.lineTo(localPos.x, localPos.y);
      context.closePath();
      context.stroke();
      this.lastPointerPosition = pos;
      this.image.getLayer().draw();
    }
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
