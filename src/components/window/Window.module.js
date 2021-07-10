import { Component, createRef } from "react";
import styles from './Window.module.css'

class Window extends Component {
  constructor(props) {
    super(props);

    this.containerRef = createRef();

    this.name = props.name || "Window";
    this.description = props.description || "This is a window!";
    this.props = props;

    this.state = {  }
  }

  componentDidMount() {
    if (this.props.width) this.containerRef.current.style.width = this.props.width;
    if (this.props.height) this.containerRef.current.style.height = this.props.height;
  }
  
  render() { 
    return (
      <div className={styles.container} ref={this.containerRef}>
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