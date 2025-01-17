import EnterBootLoaderPacket from '../telegrams/v1/cypressPackets/EnterBootLoaderPacket/index.js';
import ExitBootLoaderPacket from '../telegrams/v1/cypressPackets/ExitBootloader/index.js';
import GetFlashSizePacket from '../telegrams/v1/cypressPackets/GetFlashSize/index.js';
import SendDataPacket from '../telegrams/v1/cypressPackets/SendData/index.js';
import VerifyChecksumPacket from '../telegrams/v1/cypressPackets/VerifyChecksum/index.js';

import VerifyRowPacket from '../telegrams/v1/cypressPackets/VerifyRow/index.js'
import WriteRowDataPacket from '../telegrams/v1/cypressPackets/WriteDataRowPacket/index.js'
import BootLoaderPacketGen from './BootloaderPacketGen.js';
import FlashRow from './FlashRow.js'

import { readFile } from 'fs/promises';  // Async version of fs module
class PayloadProcessor {

    #header = null
    #siliconId = null
    #siliconRev = null
    #checkSumType = null
    #flashDataLines = null
    securityKey = null
    #payload = null;
    #file = null;
    chunkLength;
    bootloaderPacketGen = new BootLoaderPacketGen();


    constructor(payload, securityKey, chunkLength) {

        this.#payload = payload;

        // this.#header = this.getHeader();

        // this.#siliconId = this.getSiliconId();

        // this.#siliconRev = this.getSiliconRev();

        // this.#checkSumType = this.getChecksumType();

        // this.#flashDataLines = this.getFlashDataLines();

        this.securityKey = securityKey;
        this.chunkLength = chunkLength;
    }


    #readDataLines = () => {

        var lines = this.#file.split(/\r?\n/)
        let linesArr = [];

        // For each line (except the header)

        for (var i = 1; i < lines.length; i++) {

            // [1-byte ArrayID][2-byte RowNumber][2-byte DataLength][N-byte Data][1byte Checksum]
            var model = new FlashRow()
            model.arrayID = lines[i].substring(1, 3);// ie: 01
            model.rowNumber = lines[i].substring(3, 7);
            model.dataLength = lines[i].substring(7, 11); // ie: 0080
            model.data = lines[i].substring(11, lines[i].length - 2);
            model.checksum = lines[i].slice(lines[i].length - 2, lines[i].length);
            linesArr.push(model);
        }


        return linesArr;
    }

    async splitFirmwareIntoLines() {


        this.#file = await readFile(this.#payload, 'utf8')
        this.#file = this.#file.trim();

        let packetsArray = [
            new EnterBootLoaderPacket().create(),
            new GetFlashSizePacket().create()];
        let lines = this.#file.split(/\r?\n/);

        for (var i = 1; i < lines.length; i++) {

            const chunk = lines[i].substring(11, lines[i].length - 2).toUpperCase();

            const chunks = chunk.match(new RegExp(`.{1,${this.chunkLength}}`, 'g'));

            chunks.forEach((dataChunk, index) => {

                if (dataChunk.length === this.chunkLength) {
                    packetsArray.push(new SendDataPacket(dataChunk).create());

                }
                else {

                    const arrayId = lines[i].substring(1, 3).toUpperCase();
                    const rowNumber = lines[i].substring(3, 7).toUpperCase();

                    packetsArray.push(new WriteRowDataPacket(dataChunk, rowNumber, arrayId).create());
                    packetsArray.push(new VerifyRowPacket(rowNumber, arrayId).create());
                }

            })

        }

        packetsArray.push(new VerifyChecksumPacket().create())
        packetsArray.push(new ExitBootLoaderPacket().create())

        // this.#writeArrayToFile(this.#filePath, packetsArray);

        return packetsArray;
    }


    async createPureLinesFromCyacd() {


        this.#file = await readFile(this.#payload, 'utf8')
        this.#file = this.#file.trim();

        let packetsArray = [
            this.securityKey ? this.bootloaderPacketGen.enterBootLoader(this.securityKey) : this.bootloaderPacketGen.enterBootLoader(),
            this.bootloaderPacketGen.getFlashSize()];
        let lines = this.#file.split(/\r?\n/);

        for (var i = 1; i < lines.length; i++) {

            const chunk = lines[i].substring(11, lines[i].length - 2).toUpperCase();

            const chunks = chunk.match(new RegExp(`.{1,${this.chunkLength}}`, 'g'));

            chunks.forEach((dataChunk, index) => {

                if (dataChunk.length === this.chunkLength) {
                    packetsArray.push(new SendDataPacket(dataChunk).create());

                }
                else {

                    const arrayId = lines[i].substring(1, 3).toUpperCase();
                    const rowNumber = lines[i].substring(3, 7).toUpperCase();

                    packetsArray.push(new WriteRowDataPacket(dataChunk, rowNumber, arrayId).create());
                    packetsArray.push(new VerifyRowPacket(rowNumber, arrayId).create());
                }

            })

        }

        packetsArray.push(new VerifyChecksumPacket().create())
        packetsArray.push(new ExitBootLoaderPacket().create())

        return packetsArray;
    }

    getFlashDataLines = () => {
        if (!this.#flashDataLines) return this.#readDataLines();
        return this.#flashDataLines;
    }

    getHeader = () => {
        if (!this.#header) return this.#file.substring(0, 12)
        return this.#header;
    }

    getSiliconId = () => {
        if (!this.#siliconId) return this.#header.slice(0, 8);
        return this.#siliconId;
    }

    getSiliconRev = () => {

        if (!this.#siliconRev) return this.#header.slice(8, 10);
        return this.#siliconRev;
    }

    getChecksumType = () => {

        if (!this.#checkSumType) return this.#header.slice(10, 12);
        return this.#checkSumType;
    }

    //#endregion
}

export default PayloadProcessor
