import React, { Component } from 'react';
import Hirer from './hirer';
import Freelancer from './freelancer';
import './App.css';

class App extends Component {
    render() {
        return (
            <div className="App">
                <Hirer />
                <Freelancer />
            </div>
        );
    }
}

export default App;
