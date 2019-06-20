import React from 'react';
import PropTypes from 'prop-types';
const Header = ({ children }) => (

  <div>
    { children }
  </div>
);

Header.propTypes = {
  children: PropTypes.object,
};

export default Header;
