import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  position: absolute;
`;

const Header = ({ children }) => (

  <HeaderContainer>
    {children}
  </HeaderContainer>
);

Header.propTypes = {
  children: PropTypes.object,
};

export default Header;
