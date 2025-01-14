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
    #securityId = null;

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

    constructor(payload, writeMethod, bleDevice, progress) {


        this.#payload = payload;

        this.#writeMethod = writeMethod;

        this.progress = progress;

        this.em = new EventEmitter();

        this.processor = new PayloadProcessor(this.#payload, this.#securityId);

        this.rows = this.processor.splitFirmwareIntoLines();

        this.bleDevice = bleDevice;

        this.amountOfRows = this.rows.length;

        this.responseHandler = new ResponseHandler();

    }



    getPacketToSend() {

        if (this.rowIndex <= this.rows.length + 1) {
          

            this.progress({
                mac: this.bleDevice,
                rowsProgrammed: this.amountOfRows - this.rows.length,
                percentage: Math.round(( (this.amountOfRows - this.rows.length) / this.amountOfRows ) * 100),
                
            })

            return this.rows.shift();

        }
    }



    startDFU() {
        console.log("## STARTING DFU ##");
        this.#writeMethod(this.getPacketToSend(), this.bleDevice)
    }


    onResponse(response) {

        let answer = this.responseHandler.handleResponse(response);

        if (answer.isAccepted) {

            const packet = this.getPacketToSend();

            if (packet) {

                const upperCasePacket = packet;

                return this.#writeMethod(upperCasePacket, this.bleDevice);

            } else {

                console.error('getPacketToSend() returned null or undefined');

            }
        }


    }

}
