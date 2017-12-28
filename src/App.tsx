import * as React from 'react';
import './App.css';
import Display from './Display';

const logo = require('./logo.svg');

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>Bittrex Portal</h2>
        </div>

        <div className="App-body">
          <Display />
        </div>
      </div>
    );
  }
}

export default App;
