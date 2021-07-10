import { DataGrid, GridDensityTypes } from '@material-ui/data-grid';
import { Component } from 'react';
import styles from './SymbolTable.module.css'

class SymbolTable extends Component {
  constructor(props) {
    super(props);

    this.columns = [
      {
        field: 'symbolName',
        headerName: 'Name',
      },
      {
        field: 'symbolValue',
        headerName: 'Value',
      },
    ];

    this.state = {
      rows: [],
    }
  }

  setSymbols(symbolsList) {
    let newRows = symbolsList.map((symbol, id) => Object.assign({ id }, symbol));
    this.setState({ rows: newRows });
  }

  render() { 
    return (
      <div className={styles.container}>
        <div className={styles.title}>Symbol Table</div>
        <div className={styles.gridContainer}>
          {
            this.state.rows.length > 0 ? (
              <DataGrid
                classes={{root: styles.root}}
                getRowClassName={() => styles.row}
                getCellClassName={() => styles.cell}
                rows={this.state.rows}
                columns={this.columns}
                disableDensitySelector={false}
                disableColumnMenu={true}
                disableColumnSelector={true}
                hideFooter={true}
                hideFooterPagination={true}
                hideFooterRowCount={true}
                hideFooterSelectedRowCount={true}
                showCellRightBorder={false}
                showColumnRightBorder={false}
                headerHeight={0}
                density={GridDensityTypes.Compact}
              />
            ) : ( <div/> )
          }
        </div>
      </div>
    );
  }
}
 
export default SymbolTable;