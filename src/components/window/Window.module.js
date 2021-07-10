import { Component } from "react";
import styles from './Window.module.css'

class Window extends Component {
  constructor(props) {
    super(props);

    this.name = props.name || "Window";
    this.description = props.description || "This is a window!";

    this.state = {  }
  }
  
  render() { 
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.title}>{this.name}</div>-<div className={styles.description}>{this.description}</div>
        </div>
        <div className={styles.content}>
          {this.props.children}
        </div>
      </div>
    );
  }
}
 
export default Window;