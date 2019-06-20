import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Canvas extends Component {
  render() {
    return (
      <div>Canvas</div>
    );
  }
}

Canvas.propTypes = {
  children: PropTypes.string,
};

export default Canvas;
