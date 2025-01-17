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


    constructor(payload, writeMethod, bleDevice, progress, securityKey, chunkLength) {


        this.#payload = payload;

        this.#writeMethod = writeMethod;

        this.progress = progress;

        this.securityKey = securityKey;

        this.chunkLength = chunkLength;

        this.em = new EventEmitter();

        this.processor = new PayloadProcessor(this.#payload, this.securityKey, this.chunkLength);

        this.bleDevice = bleDevice;

        this.responseHandler = new ResponseHandler();


    }




    getPacketToSend() {

        if (this.rowIndex <= this.rows.length + 1) {


            this.eventEmitter.emit('progress', {
                mac: this.bleDevice,
                rowsProgrammed: this.amountOfRows - this.rows.length,
                percentage: Math.round(((this.amountOfRows - this.rows.length) / this.amountOfRows) * 100),

            })

            return this.rows.shift();

        }
    }



    async startDFU(pureVersion = true) {

        console.log("## STARTING DFU ##");

        this.rows = pureVersion ? await this.processor.createPureLinesFromCyacd() : await this.processor.splitFirmwareIntoLines();

        this.amountOfRows = this.rows.length;

        let packet = this.getPacketToSend();

        this.#writeMethod(packet, this.bleDevice)

        this.eventEmitter.emit("write", { data: packet, mac: this.bleDevice });
    }


    onResponse(response) {

        let answer = this.responseHandler.handleResponse(response);



        if (answer.isAccepted) {

            const packet = this.getPacketToSend();

            this.eventEmitter.emit("response", { data: response, mac: this.bleDevice, answer: answer });


            if (packet) {

                const upperCasePacket = packet;

                this.eventEmitter.emit("write", { data: upperCasePacket, mac: this.bleDevice });

                this.#writeMethod(upperCasePacket, this.bleDevice);

            } else {

                console.error('getPacketToSend() returned null or undefined');

            }
        }

    }





}
