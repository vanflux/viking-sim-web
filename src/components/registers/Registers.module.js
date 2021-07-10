import styles from './Registers.module.css';
import { Component } from "react";
import utils from '../../utils';

class Registers extends Component {
  constructor(props) {
    super(props);
    this.registerBank = props.registerBank;

    this.registerInfos = Object.entries(this.registerBank.getRegisterInfos());
    
    this.state = { };
  }

  render() { 
    return (
      <div className={styles.container}>
        <div className={styles.title}>Registers</div>
        
        <div className={styles.content}>
          <div className={styles.generalRegisterList}>
            { this.registerInfos.map(([name], i) => <Register key={i} name={name} registerBank={this.registerBank} />) }
          </div>
          
          <div className={styles.pcRegister}>
            <Register name="pc" registerBank={this.registerBank} />
          </div>
        </div>
      </div>
    );
  }
}

class Register extends Component {
  constructor(props) {
    super(props);

    this.name = props.name;
    this.registerBank = props.registerBank;
    this.aliases = this.registerBank.getRegisterInfo(this.name).aliases;

    this.state = { value: 0 };
  }

  componentDidMount() {
    let self = this;
    let changeValue = utils.callLimiter((newValue) => {
      self.setState({ value: newValue });
    }, 50);

    this.valueUpdateHandler = ({registerName, newValue}) => {
      if (registerName !== self.name) return;
      changeValue(newValue);
    };
    this.registerBank.on('value update', this.valueUpdateHandler);
  }

  componentWillUnmount() {
    this.registerBank.off('value update', this.valueUpdateHandler);
  }

  render() { 
    return (
      <div className={styles.registerContainer}>
        <div>{this.name}{this.aliases.length > 0 ? (' (' + this.aliases.join(',') + ')') : ''}</div>
        <div>{this.state.value.toString(16).padStart(4, '0')}</div>
      </div>
    );
  }
}
 
export default Registers;