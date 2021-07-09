import { Box } from '@material-ui/core';
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
      rows: [
        { id: 1, symbolName: 'Main', symbolValue: '111' },
        { id: 2, symbolName: 'Main2', symbolValue: '41' },
        { id: 3, symbolName: 'Repeat', symbolValue: '25' },
        { id: 4, symbolName: 'Repeat2', symbolValue: '312' },
        { id: 5, symbolName: 'Main5', symbolValue: '423' },
      ],
    }
  }
  render() { 
    return (
      <div className={styles.container}>
        <div className={styles.title}>Symbol Table</div>
        <div className={styles.gridContainer}>
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
        </div>
      </div>
    );
  }
}
 
export default SymbolTable;