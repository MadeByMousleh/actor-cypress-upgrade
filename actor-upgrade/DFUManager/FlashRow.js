var FlashRow = function (arrayID, rowNumber, dataLength, data, checksum) {
    this.arrayID = arrayID
    this.rowNumber = rowNumber
    this.dataLength = dataLength
    this.data = data
    this.checksum = checksum
  }
              // [1-byte ArrayID][2-byte RowNumber][2-byte DataLength][N-byte Data][1byte Checksum]

export default FlashRow;
  