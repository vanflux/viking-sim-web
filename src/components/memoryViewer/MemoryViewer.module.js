import React, { Component, createRef } from "react";
import { useResizeDetector } from "react-resize-detector";
import styles from './MemoryViewer.module.css'

class MemoryViewer extends Component {
  constructor(props) {
    super(props);

    if (!props.memory) throw new Error('props.memory null');

    this.memory = props.memory;

    this.tbodyRef = createRef();
    this.memoryScrollRef = createRef();
    this.memoryScrollAuxRef = createRef();
    this.memoryAreaRef = createRef();

    this.columns = 8;
    this.rowsToShow = 32;
    this.rows = 0;
    this.dataItemBytes = 2;
    this.scrollHeight = 0;
    this.scrollTop = 0;
    this.rowOffset = 0;
    this.wordHighlightContexts = {};

    this.state = {  }
  }

  componentDidMount() {
    
    // Request data count
    let dataCount = null;
    while(dataCount == null) dataCount = this.getDataCount();
    this.rows = dataCount / this.columns / this.dataItemBytes;

    // Setup scroll
    this.scrollHeight = this.rows;
    this.setScrollHeight(this.scrollHeight);

    // Get initial data
    let data = this.getData();
    this.recreateTable(data);

    // scroll logic
    this.memoryAreaRef.current.onwheel = (e) => {
      this.memoryScrollRef.current.scrollTop += e.deltaY > 0 ? 1 : -1;
      e.preventDefault();
    }
    this.memoryScrollRef.current.onscroll = async (e) => {
      this.scrollTop = this.memoryScrollRef.current.scrollTop;
      this.rowOffset = Math.floor((this.rows - this.rowsToShow) * (this.scrollTop / (this.scrollHeight - this.memoryScrollRef.current.getBoundingClientRect().height)));
      let data = this.getData();
      this.recreateTable(data);
      this.wordHighlightContexts = {};
      e.preventDefault();
    }

    // Memory Handlers

    this.onResetHandler = this.reset.bind(this);

    this.onStorageWriteByteHandler = (address, byte) => {
      if (address >= this.dataOffset && address < this.dataOffset + this.dataCount) {
        this.updateByteAt(address, byte);
      }
    };
    
    this.onStorageWriteWordHandler = (address, word) => {
      if (address >= this.dataOffset && address < this.dataOffset + this.dataCount) {
        this.updateByteAt(address, (word >> 8) & 0xFF);
        this.updateByteAt(address + 1, word & 0xFF);
      }
    };
    
    this.memory.on('reset', this.onResetHandler);
    this.memory.on('storage write byte', this.onStorageWriteByteHandler);
    this.memory.on('storage write word', this.onStorageWriteWordHandler);
  }

  componentWillUnmount() {
    this.memory.off('reset', this.onResetHandler);
    this.memory.off('storage write byte', this.onStorageWriteByteHandler);
    this.memory.off('storage write word', this.onStorageWriteWordHandler);
  }

  updateByteAt(address, byte) {
    let tbyteDiv = this.getByteElem(address);
    tbyteDiv.textContent = byte.toString(16).padStart(2, '0');
    this.highlightByte(address, tbyteDiv);
  }
    
  getByteElem(address) {
    let item = Math.floor(address / this.dataItemBytes);
    let offset = address % this.dataItemBytes;

    let column = item % this.columns;
    let row = Math.floor(item / this.columns) - this.rowOffset;
    
    let tRow = this.tbodyRef.current.childNodes[row+1];
    let tItem = tRow.childNodes[column+1];
    let tbyteDiv = tItem.childNodes[offset];
    return tbyteDiv;
  }

  highlightByte(address, elem) {
    let ctx = this.wordHighlightContexts[address];
    if (ctx) {
      ctx.value = 1;
    } else {
      ctx = { value: 1 };
      this.wordHighlightContexts[address] = ctx;

      let id = setInterval(() => {
        if (ctx.value <= 0) {
          elem.style['background-color'] = 'rgba(255,0,0,0)';
          clearInterval(id);
          delete this.wordHighlightContexts[address];
        } else {
          elem.style['background-color'] = 'rgba(255,0,0,' + ctx.value + ')';
          ctx.value -= 0.05;
        }
      }, 50);
    }
  }

  setScrollHeight(height) {
    this.memoryScrollAuxRef.current.style.height = height + 'px';
  }
  
  handleHeight(height) {
    if (this.tbodyRef.current === null) return;
    if (this.tbodyRef.current.childNodes.length === 0) return;
    let firstRow = this.tbodyRef.current.childNodes[0];
    let rowHeight = firstRow.getBoundingClientRect().height;
    let newRowsToShow = Math.floor(height / rowHeight) - 1;
    if (newRowsToShow <= 0) return;
    if (this.rowsToShow === newRowsToShow) return;
    this.rowsToShow = newRowsToShow;
    this.recreateTable(this.getData());
  }

  recreateTable(data) {
    if (this.tbodyRef.current == null) return;

    let rowsCount = Math.ceil(data.length / this.columns);
    
    let html = '';
    html += '<tr>';
    html += '<td>';
    html += 'X';
    html += '</td>';
    for (let x = 0; x < this.columns * this.dataItemBytes; x += this.dataItemBytes) {
      html += '<td class="' + styles.memoryColumnNumber + '">';
      html += x.toString(16).padStart(4, '0');
      html += '</td>';
    }
    html += '</tr>';
    
    let _x = 0;
    for (let y = 0; y < rowsCount; y++) {
      html += '<tr>';
      html += '<td class="' + styles.memoryRowNumber + '">';
      html += (this.rowOffset * this.dataItemBytes * this.columns + y * this.dataItemBytes * this.columns).toString(16).padStart(4, '0');
      html += '</td>';
      
      for (let x = 0; x < this.columns; x++) {
        let item = data[y * this.columns + x];
        let memDataHtml = '';
        for (let i = 0; i < this.dataItemBytes; i++) {
          let byte = item & 0xFF;
          item >>= 8;
          memDataHtml = '<div style="display:inline">' + byte.toString(16).padStart(2, '0') + '</div>' + memDataHtml;
        }
        html += '<td class="' + styles.memoryData + '">' + memDataHtml + '</td>';
      }
      html += '</tr>';
      if (_x === this.columns) {
          _x = 0;
      }
    }

    this.tbodyRef.current.innerHTML = html;
  }

  reset() {
    for (let i = this.dataOffset; i < this.dataOffset + this.dataCount; i++) {
      let tbyteDiv = this.getByteElem(i);
      tbyteDiv.textContent = '00';
    }
  }

  getDataCount() {
    return this.memory.getMemoryRegions().io;
  }

  getData() {
    this.dataOffset = this.rowOffset * this.columns * 2;
    this.dataCount = this.columns * this.rowsToShow * 2;
    let data = this.memory.getWordsFromRange(this.dataOffset, this.dataOffset + this.dataCount);
    return data;
  }

  render() { 
    const MemoryArea = () => {
      const { height, ref } = useResizeDetector();
      return (
        <div ref={ref} className={styles.memoryAreaContainer}>
          {this.handleHeight(height)}
          <table className={styles.memoryArea} ref={this.memoryAreaRef}>
            <tbody ref={this.tbodyRef}></tbody>
          </table>
        </div>
      );
    };
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.memoryScroll} ref={this.memoryScrollRef}><div ref={this.memoryScrollAuxRef}></div></div>
          <MemoryArea />
        </div>
      </div>
    );
  }
}
 
export default MemoryViewer;