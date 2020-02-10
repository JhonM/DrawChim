import CanvasTool from '../CanvasTool';

class Pencil extends CanvasTool {
  configureCanvas(props) {
    this._tool = props.tool;
    this._color = props.color;
    this._lineWidth = props.lineWidth;
  }

  onMouseDown(e, parent) {
    this.isDrawing = true;
    // this.setState({ isDrawing: true });

    const stage = parent;
    this.lastPointerPosition = stage.getPointerPosition();
  }

  onMouseUp() {
    this.isDrawing = false;
    // this.setState({ isDrawing: false });
  }

  onMouseMove(e, image) {
    if (this.isDrawing) {
      this.draw(image);
    }
  }

  draw(image) {
    const mode = this._tool;
    const context = this._canvas.getContext('2d');
    // console.log('drawing');

    context.strokeStyle = this._color || this.state.color;
    context.lineJoin = 'round';
    context.lineWidth = this._lineWidth || this.state.lineWidth;

    if (mode === 'brush') {
      context.globalCompositeOperation = 'source-over';
    } else if (mode === 'eraser') {
      context.globalCompositeOperation = 'destination-out';
    }

    context.beginPath();

    var localPos = {
      x: this.lastPointerPosition.x - image.x(),
      y: this.lastPointerPosition.y - image.y(),
    };

    // console.log('Move to', localPos);
    context.moveTo(localPos.x, localPos.y);
    // console.log('context', context);

    const stage = image.parent.parent;

    var pos = stage.getPointerPosition();
    localPos = {
      x: pos.x - image.x(),
      y: pos.y - image.y(),
    };

    // console.log('line to', localPos);
    context.lineTo(localPos.x, localPos.y);
    context.closePath();
    context.stroke();
    this.lastPointerPosition = pos;
    image.getLayer().draw();
  }
}

export default Pencil;
