import styles from './Home.module.css'
import Simulator from "../simulator/Simulator.module";
import Window from '../window/Window.module';
import React, { Component, createRef } from 'react';
class Home extends Component {  
  constructor(props) {
    super(props);
    Home.instance = this;
    this.keyIndex = 0;
    this.windowsContainerRef = createRef();
    this.aboutRef = createRef();
    this.windowObjs = [];
    this.state = { };
  }

  componentDidMount() {
    this.spawnWindow('Simulator', 'Viking CPU Simulator', 970, 710, <Simulator />);
  }

  closeAbout() {
    this.aboutRef.current.remove();
  }

  spawnWindow(name, description, width, height, elem) {
    return new Promise((resolve, reject) => {
      try {
        let ref = createRef();
        let window = <Window key={this.keyIndex++} name={name} description={description} width={width + 'px'} height={height + 'px'} ref={ref}>{elem}</Window>;
        let winObj = {window, ref};
        this.windowObjs.push(winObj);
        this.setState({}, () => { resolve(winObj) });
      } catch (exc) {
        reject(exc);
      }
    })
  }

  render() {
    return (
      <div className={styles.container}>
        <div className={styles.windowsContainer} ref={this.windowsContainerRef}>
          { this.windowObjs.map(x=>x.window) }
        </div>
        <div className={styles.aboutContainer} ref={this.aboutRef}>
          <div>Developed by <a href="https://github.com/vanflux">vanflux</a></div>
          <div>Viking architecture by <a href="https://github.com/sjohann81">sjohann81</a></div>
          <div>Repo Link: <a href="https://github.com/vanflux/viking-sim-web">viking-sim-web</a></div>
          <button onClick={this.closeAbout.bind(this)}>Close This Pop-up</button>
        </div>
      </div>
    );
  }
}
 
export default Home;