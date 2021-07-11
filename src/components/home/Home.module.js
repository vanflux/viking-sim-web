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
    this.state = { };

    this.windows = [];
  }

  componentDidMount() {
    this.spawnWindow('Simulator', 'Viking CPU Simulator', 980, 710, <Simulator />)
  }

  closeAbout() {
    this.aboutRef.current.remove();
  }

  spawnWindow(name, description, width, height, comp) {
    let window = <Window key={this.keyIndex++} name={name} description={description} width={width + 'px'} height={height + 'px'}>{comp}</Window>;
    this.windows.push(window);
    this.setState({});
  }

  render() {
    return (
      <div className={styles.container}>
        <div className={styles.windowsContainer} ref={this.windowsContainerRef}>
          { this.windows }
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