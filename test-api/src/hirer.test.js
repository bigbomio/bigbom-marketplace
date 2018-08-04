import React from 'react';
import ReactDOM from 'react-dom';
import Hirer from './hirer';

it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Hirer />, div);
    ReactDOM.unmountComponentAtNode(div);
});
