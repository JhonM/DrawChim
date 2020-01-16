/**
 * Testing Board component
 */

import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import Board from '../index';

Enzyme.configure({ adapter: new Adapter() });

test('<Board /> initial render', () => {
  const board = shallow(<Board />);

  expect(board);
});
