import React, { Component } from 'react';
import { Stage, Layer, Image } from 'react-konva'
import PropTypes from 'prop-types';

class Canvas extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isDrawing: false,
      mode: 'bruse',
    }
  }

  componentDidMount() {
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight
    const context = canvas.getContext('2d');

    this.setState({ canvas, context });
  }

  handleMouseDown(context) {
    console.log('mousedown');
    context.setState({ isDrawing: true });

    const stage = this.image.parent.parent;
    context.lastPointerPosition = stage.getPointerPosition();
  }

  handleMouseUp(context) {
   console.log('mouseup');
   context.setState({ isDrawing: false });
  }

  handleMouseMove(e) {
    const { context, isDrawing, mode } = e.state;

    if (isDrawing) {
      console.log('drawing');

      context.strokeStyle = '#000';
      context.lineJoin = 'round';
      context.lineWidth = 5;

      if (mode === 'brush') {
        context.globalCompositeOperation = 'source-over';
      } else if (mode === "eraser") {
        context.globalCompositeOperation = 'destination-out';
      }

      context.beginPath();

      var localPos = {
        x: e.lastPointerPosition.x - e.image.x(),
        y: e.lastPointerPosition.y - e.image.y(),
      }

      console.log('Move to', localPos);
      context.moveTo(localPos.x, localPos.y);
      console.log('context', context);

      const stage = e.image.parent.parent;

      var pos = stage.getPointerPosition();
      localPos = {
        x: pos.x - e.image.x(),
        y: pos.y - e.image.y(),
      }

      console.log('line to', localPos);
      context.lineTo(localPos.x, localPos.y);
      context.closePath();
      context.stroke();
      e.lastPointerPosition = pos;
      e.image.getLayer().draw();
    }
  }

  render() {
    const { canvas } = this.state;
    console.log('canvas', canvas);

    return (
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
    >
        <Layer>
           <Image
            image={canvas}
            ref={node => (this.image = node)}
            width={window.innerWidth}
            height={window.innerHeight}
            stroke='blue'
            onMouseDown={() => this.handleMouseDown(this)}
            onMouseUp={() => this.handleMouseUp(this)}
            onMouseMove={() => this.handleMouseMove(this)}
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
