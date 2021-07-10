import React, { Component } from 'react';
import { HashRouter, Route } from "react-router-dom";
import Home from '../home/Home.module';
import styles from './App.module.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { };
  }

  render() {
    return (
     <HashRouter basename='/'>
      <div className={styles.container}>
       <Route exact path="/" component={Home} />
      </div>
     </HashRouter>
    );
  }
}

export default App;
