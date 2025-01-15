import PayloadProcessor from "./payloadProcessor.js";
import { EventEmitter } from 'events';
import ResponseHandler from "./ResponseHandler.js";


export default class DFUController {

    startByte = "01";
    endByte = "17";
    em = null;

    enterBootLoaderCommand = "38";

    writeRowCommand = "39";

    verifyRowCommand = "3a";

    sendDataCommand = "37";

    getFlashCommand = "32";

    #writeMethod = null;

    #payload = null;

    currentStep = 1;

    rowIndex = 0;
    commandIndex = 0;

    processor = null;

    bleDevice = null;

    rows = [];

    iterations = 0;

    responseHandler;

    readResponse;

    progress;

    securityKey;

    chunkLength;

    eventEmitter = new EventEmitter();

    onRead;

    constructor(payload, writeMethod, onRead, bleDevice, progress, securityKey, chunkLength) {


        this.#payload = payload;

        this.#writeMethod = writeMethod;

        this.progress = progress;

        this.securityKey = securityKey;

        this.chunkLength = chunkLength;

        this.em = new EventEmitter();

        this.processor = new PayloadProcessor(this.#payload, this.securityKey, this.chunkLength);

        this.rows = this.processor.splitFirmwareIntoLines();

        this.bleDevice = bleDevice;

        this.amountOfRows = this.rows.length;

        this.responseHandler = new ResponseHandler();

        this.onRead = onRead;

        

    }




    getPacketToSend() {

        if (this.rowIndex <= this.rows.length + 1) {
          

            this.eventEmitter.emit('progress', {
                mac: this.bleDevice,
                rowsProgrammed: this.amountOfRows - this.rows.length,
                percentage: Math.round(( (this.amountOfRows - this.rows.length) / this.amountOfRows ) * 100),
                
            })

            return this.rows.shift();

        }
    }



    startDFU() {
        console.log("## STARTING DFU ##");

        let packet = this.getPacketToSend();

        
        this.#writeMethod(this.getPacketToSend(), this.bleDevice)

        this.eventEmitter.emit("write", {data: packet, mac: this.bleDevice});
    }


    onResponse() {

        this.onRead((response) => {

        let answer = this.responseHandler.handleResponse(response);

        this.eventEmitter.emit("response", {data: packet, mac: this.bleDevice});


        if (answer.isAccepted) {

            const packet = this.getPacketToSend();

            if (packet) {

                const upperCasePacket = packet;

                this.eventEmitter.emit("write", {data: upperCasePacket, mac: this.bleDevice});

                this.#writeMethod(upperCasePacket, this.bleDevice);

            } else {

                console.error('getPacketToSend() returned null or undefined');

            }
        }
    })  

    }



    

}
