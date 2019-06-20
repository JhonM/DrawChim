import React from 'react';
import PropTypes from 'prop-types';

const Nav = ({ children }) => (
  <div>
    { children }
  </div>
);

Nav.propTypes = {
  children: PropTypes.object,
};

export default Nav;
