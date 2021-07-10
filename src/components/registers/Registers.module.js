import styles from './Registers.module.css';
import { Component } from "react";
import utils from '../../utils';

class Registers extends Component {
  constructor(props) {
    super(props);

    if (!props.registerBank) throw new Error('props.registerBank null');
    if (!props.simulation) throw new Error('props.simulation null');

    this.registerBank = props.registerBank;
    this.simulation = props.simulation;

    this.registerInfos = Object.entries(this.registerBank.getRegisterInfos());
    
    this.state = { };
  }

  componentDidMount() {
    let self = this;
    this.valueUpdateHandler = utils.callLimiter(() => {
      self.setState({});
    }, 50);
    this.registerBank.on('value update', this.valueUpdateHandler);
    this.simulation.on('pc update', this.valueUpdateHandler);
  }

  componentWillUnmount() {
    this.registerBank.off('value update', this.valueUpdateHandler);
    this.simulation.off('pc update', this.valueUpdateHandler);
  }

  render() {
    return (
      <div className={styles.container}>
        <div className={styles.title}>Registers</div>
        
        <div className={styles.content}>
          <div className={styles.generalRegisterList}>
            { this.registerInfos.map(([name, infos], i) => <Register key={i} name={name} aliases={infos.aliases} value={this.registerBank.getUValue(name)} />) }
          </div>
          
          <div className={styles.pcRegister}>
            <Register name="pc" aliases={[]} value={this.simulation.getPC()} />
          </div>
        </div>
      </div>
    );
  }
}

class Register extends Component {
  constructor(props) {
    super(props);
    this.props = props;
  }

  render() { 
    return (
      <div className={styles.registerContainer}>
        <div>{this.props.name}{this.props.aliases.length > 0 ? (' (' + this.props.aliases.join(',') + ')') : ''}</div>
        <div>{this.props.value.toString(16).padStart(4, '0')}</div>
      </div>
    );
  }
}
 
export default Registers;