import ActorBootPacket from '../../ActorBootPacket/index.js';

 class EnterBootLoaderPacket extends ActorBootPacket  {

    constructor() {
        super("01380000C7FF17")
     }
 
}

export default EnterBootLoaderPacket;



/*
B.2.1 Enter DFU
Begins a DFU operation. All other commands except Exit DFU are ignored until this command is received.
Responds with device information and DFU SDK version.

• Input
- Command Byte: 0x38
- Data Bytes:
-
- 4 bytes (optional): product ID. If these bytes are included, and they are not 00 00 00 00, they
are compared to device product ID data.

• Output
- Status/Error Codes:
- Success
- Error Command
- Error Data, used for product ID mismatch
- Error Length
- Error Checksum

- Data Bytes:
- 4 bytes: Device JTAG ID
- 1 byte: Device revision
- 3 bytes: DFU SDK version

*/