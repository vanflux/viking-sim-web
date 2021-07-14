import { Component } from 'react';
import utils from '../../utils';
import styles from './SymbolTable.module.css'

class SymbolTable extends Component {
  constructor(props) {
    super(props);

    if (!props.architecture) throw new Error('props.architecture null');
    this.architecture = props.architecture;

    this.onSymbolNameClick = typeof props.onSymbolNameClick === 'function' ? props.onSymbolNameClick : ()=>{};
    this.onSymbolValueClick = typeof props.onSymbolValueClick === 'function' ? props.onSymbolValueClick : ()=>{};

    this.state = {
      symbols: [],
    }
  }

  setSymbolTable(symbolTable) {
    let symbols = Object.entries(symbolTable).map(([symbolName, symbolValue]) => ({ symbolName, symbolValue }));
    this.setState({ symbols });
  }

  render() { 
    return (
      <div className={styles.container}>
        <div className={styles.title}>Symbol Table</div>
        <div className={styles.content}>
          <table border="1" frame="void" rules="rows">
            <tbody>
              {
                this.state.symbols.map((symbol, id) => (
                  <tr key={id}>
                    <td className={styles.symbolName} onClick={()=>this.onSymbolNameClick(symbol)}>{symbol.symbolName}</td>
                    <td className={styles.symbolValue} onClick={()=>this.onSymbolValueClick(symbol)}>{'0x'+utils.signedNumberToHex(symbol.symbolValue, this.architecture.getByteWidth())}</td>
                  </tr>
                ))
              }
              {
                (this.state.symbols && this.state.symbols.length > 0) ? <tr className={styles.fillAllSpace}></tr> : <tr/>
              }
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}
 
export default SymbolTable;