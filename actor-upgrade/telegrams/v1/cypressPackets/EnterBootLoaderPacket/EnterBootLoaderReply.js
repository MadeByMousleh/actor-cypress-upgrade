import ActorBootPacketReply from "../../wygwamPackets/ActorBootPacket/ActorBootPacketReply.js";


export default class EnterBootLoaderPacketReply extends ActorBootPacketReply {


    constructor(reply) {
        super(reply);
    }


    isAccepted()
    {
        return this.statusCode.value.join("") === "00"
    }

    getJTAG()
    {

    }

    getDeviceRevision()
    {

    }

    getDfuSdkVersion()
    {

    }

    getStatus()
    {
        
    }


}


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