
export default class BootLoaderPacketGen {



    //#region private variables

    #startOfPacket = 1;
    #endOfPacket = 17;

    startByte = "01";
    endByte = "17";
    securityId = [0x49, 0xA1, 0x34, 0xB6, 0xC7, 0x79];

    enterBootLoaderCommand = "38";


    /**
 * Calculates the messages CRC16.
 *
 * @param {message} message the data message.
 * @return {number} the calculated CRC16.
 * 
 * Source: github.com/yaacov/node-modbus-serial
 */

    calcChecksum(message) {

        let sum = 0;

        for (let i = 0; i < message.length; i++) {
            sum += message[i];
        }

        let crc = (1 + (~sum & 0xFFFF)) & 0xFFFF;

        if (crc > 65535) { crc = crc - 65535 - 1; }

        return crc;

    };

    #calcChecksum(message) {

        let sum = 0;

        for (let i = 0; i < message.length; i++) {
            sum += message[i];
        }

        let crc = (1 + (~sum & 0xFFFF)) & 0xFFFF;

        if (crc > 65535) { crc = crc - 65535 - 1; }

        return crc;

    };


    #calcCrc16(message) {
        let crc = 0xFFFF;

        if (message.length === 0) return ~crc;

        for (let i = 0; i < message.length; i++) {

            let tmp = 0x00FF & message[i];

            for (let j = 0; j < 8; j++, tmp >>= 1) {

                if ((crc & 0x0001) ^ (tmp & 0x0001)) { crc = (crc >> 1) ^ 0x8408; }
                else { crc >>= 1; }

            }
        }

        crc = ~crc;

        let tmp = crc;

        crc = (crc << 8) | (tmp >> 8 & 0xFF);

        return crc;
    }

    /**
     *  Providing the nessecary information to calculate the CRC checksum of a message
     * @param {1 byte} startByte 
     * @param {1 byte} command 
     * @param {2 bytes} dataLength 
     * @param {n bytes} data 
     */
    #getCrcChecksum(startByte, command, dataLength, data) {

    }

    swap16(val) {
        return ((val & 0xFF) << 8) | ((val >> 8) & 0xFF);
    }

    //#endregion

    //#region  Sizes of each part of the boot-loader packet structure

    startOfPacketByteSize = 1;
    #commandByteSize = 1;
    #dataLengthByteSize = 2;
    #checksumByteSize = 2;
    endOfPacketLength = 1;

    //#endregion

    constructor() {
    }


    // createPacket() {

    //     const buffer = Uint16Array.from([this.#startOfPacket, this.command, ...this.dataLength, ...this.data]);
    //     const checkSum = this.swap16(this.#calcChecksum(buffer));
    //     console.log(checkSum);
    //     const message = Uint16Array.from([...buffer, checkSum, this.#endOfPacket]);

    //     return message;
    // }


    createPacket39(command, data, dataLength) {
        const buffer = Uint16Array.from([this.#startOfPacket, command, ...dataLength, ...data]);
        const checkSum = this.swap16(this.#calcChecksum(buffer));
        const message = Uint16Array.from([...buffer, checkSum, this.#endOfPacket]);

        return message;
    }

    createPacket38(command, data, dataLength) {
        const buffer = Uint16Array.from([this.#startOfPacket, command, ...dataLength, ...data]);
        const checkSum = this.swap16(this.#calcChecksum(buffer));
        const message = Uint16Array.from([...buffer, checkSum, this.#endOfPacket]);

        return message;
    }

    generatePacket37(data) {

        const length = Buffer.from(data).byteLength;
        const commandByteLength = 1;
        const dataByteLength = 2;

        const finalLength = this.d2h((length + commandByteLength + dataByteLength)).match(/.{1,2}/g);


        calcDataLength = Buffer.from(dataBuffer.byteLength.toString(), 'hex');

        const buffer = Buffer.from([this.#startOfPacket, 0x37, ...calcDataLength, ...data]);
        const checkSum = this.#calcChecksum(buffer);
        const result = checkSum.toString(16).match(/.{1,2}/g) ?? [];
        message = Buffer.from([...buffer, parseInt(result[1], 16), parseInt(result[0], 16), parseInt('17', 16)]);


        return message;
    }

    d2h(d) {
        var h = (d).toString(16);
        return h.length % 2 ? '0' + h : h;
    }

    generatePacket(command, data, dataLength) {

        const length = Buffer.from(data).byteLength;
        const commandByteLength = 1;
        const dataByteLength = 2;

        const finalLength = this.d2h((length + commandByteLength + dataByteLength)).match(/.{1,2}/g);


        const buffer = Buffer.from([this.#startOfPacket, command, [`${finalLength[1]}${finalLength[0]}`], ...data]);
        const checkSum = this.#calcChecksum(buffer);
        const result = checkSum.toString(16).match(/.{1,2}/g) ?? [];
        // console.log(result);
        const message = Buffer.from([...buffer, parseInt(result[1], 16), parseInt(result[0], 16), parseInt('17', 16)], 'hex');

        return message;
    }

    swap16String(string) {
        const stringArr = string.split("");
        return `${stringArr[2]}${stringArr[3]}${stringArr[0]}${stringArr[1]}`
    }

    calculateDataLength(byteLength) {

        let result = byteLength.toString(16).padStart(4, '0')

        result = this.swap16String(result);

        return Buffer.from(result, 'hex');
    }

    calculateChecksum(command, dataLengthBuffer, dataBuffer) {
        const checkSumBuffer = Buffer.from([0x01, command, ...dataLengthBuffer, ...dataBuffer]);

        let checksum = this.#calcChecksum(checkSumBuffer)

        checksum = this.swap16String(checksum.toString(16));

        return Buffer.from(checksum, 'hex');
    }

    calculateChecksumString(command) {

        let checksum = this.#calcChecksum(command.map(s => parseInt(s, 16)))
        checksum = this.swap16String(checksum.toString(16));
        return Buffer.from(checksum, 'hex').toString('hex');
    }

    createEnterBootLoaderPacket() {

        const dataBuffer = Buffer.from(this.securityId, 'hex');

        const length = this.calculateDataLength(dataBuffer.byteLength);

        const checksum = this.calculateChecksum(0x38, length, dataBuffer)

        const buffer = Buffer.from([0x01, 0x38, ...length, ...dataBuffer, ...checksum, 0x17], 'hex')

        const message = buffer.toString('hex');

        return message;
    }

    createSendDataPacket(data) {

        const command = 0x37;

        const dataBuffer = Buffer.from(data, 'hex');

        const length = this.calculateDataLength(dataBuffer.byteLength);

        const checksum = this.calculateChecksum(command, length, dataBuffer)

        const buffer = Buffer.from([this.startByte, command, ...length, ...dataBuffer, ...checksum, this.endByte], 'hex')

        const message = buffer.toString('hex');

        return message;
    }

    createProgramRowPacket(row, arrayId, data) {

        const command = 0x39;


        const dataBuffer = Buffer.from(data, 'hex');

        const length = this.calculateDataLength(dataBuffer.byteLength);

        const checksum = this.calculateChecksum(command, length, dataBuffer)

        const rowBuffer = Buffer.from(row, 'hex');


        const buffer = Buffer.from([this.startByte, command, arrayId, ...rowBuffer, ...length, ...dataBuffer, ...checksum, this.endByte], 'hex')

        const message = buffer.toString('hex');

        return message;
    }


    combineArray(originalArray) {
        const combinedArray = [];

        for (let i = 0; i < originalArray.length; i += 2) {
            if (i + 1 < originalArray.length) {
                const combinedItem = originalArray[i] + originalArray[i + 1];
                combinedArray.push(combinedItem);
            } else {
                // If there's an odd number of elements, just push the last item as-is
                combinedArray.push(originalArray[i]);
            }
        }

        return combinedArray;
    }


    enterBootLoader(securityId) {

        let packet = [];


        if (!securityId) {

            packet[0] = this.startByte;
            packet[1] = this.enterBootLoaderCommand;
            packet[2] = "00";
            packet[3] = "00";
            packet[4] = "C7";
            packet[5] = "FF";
            packet[6] = "17";
        }

        else {
            let securityIdArr = securityId.match(/.{1,2}/g) ?? [];


            packet[0] = this.startByte;
            packet[1] = this.enterBootLoaderCommand;

            let dataLength = securityIdArr.length.toString(16).padStart(4, '0');
            dataLength = this.swap16String(dataLength).match(/.{1,2}/g) ?? [];
            packet = packet.concat(dataLength, securityIdArr);
            let checksum = this.calculateChecksumString(packet);
            packet = packet.concat(checksum, this.endByte);
        }

        return packet.join("");
    }

    enterBootLoaderActor() {

        let packet = [];

        packet[0] = this.startByte;
        packet[1] = this.enterBootLoaderCommand;
        packet[2] = "00";
        packet[3] = "00";
        packet[4] = "C7";
        packet[5] = "FF";
        packet[6] = "17";

        let securityIdArr = securityId.match(/.{1,2}/g) ?? [];
        
        packet[0] = this.startByte;
        packet[1] = this.enterBootLoaderCommand;

        dataLength = this.swap16String(dataLength).match(/.{1,2}/g) ?? [];
        packet = packet.concat(dataLength, securityIdArr);
        let checksum = this.calculateChecksumString(packet);
        packet = packet.concat(checksum, this.endByte);

        return packet.join("");
    }


    getFlashSize() {
        let packet = [];

        packet[0] = '01';
        packet[1] = '32';
        packet[3] = '01';
        packet[4] = '00';
        packet[5] = '00';
        packet[6] = 'CC';
        packet[7] = 'FF';
        packet[8] = '17';

        return packet.join("");

    }


    sendDataPacket(data) {
        let packet = [];

        const dataLength = data.length / 2;

        let splittedDataLength = this.swap16String(dataLength.toString(16).padStart(4, '0'));

        splittedDataLength = splittedDataLength.match(/.{1,2}/g);

        packet[0] = '01';
        packet[1] = '37';
        packet[2] = splittedDataLength[0];
        packet[3] = splittedDataLength[1];

        const splittedData = data.match(/.{1,2}/g);
        packet = packet.concat(splittedData);
        const checksum = this.calculateChecksumString(packet);
        packet = packet.concat(checksum, this.endByte);

        return packet.join("");

    }


    writeRowPacket(arrayId, rowNumber, data) {
        let packet = [];


        const splittedRow = this.swap16String(rowNumber).match(/.{1,2}/g);

        const dataLength = (data.length / 2) + 3; // +3 is for start packet, end packet, and command

        let splittedDataLength = this.swap16String(dataLength.toString(16).padStart(4, '0'));

        splittedDataLength = splittedDataLength.match(/.{1,2}/g);



        packet[0] = '01';
        packet[1] = '39';
        packet[2] = splittedDataLength[0];
        packet[3] = splittedDataLength[1];
        packet[4] = arrayId;
        packet[5] = splittedRow[0];
        packet[6] = splittedRow[1];

        const splittedData = data.match(/.{1,2}/g);

        packet = packet.concat(splittedData);


        const checksum = this.calculateChecksumString(packet);

        // console.log('--------------------', arrayId, '--------------------')
        // console.log('--------------------', checksum, '--------------------')
        // console.log('--------------------', rowNumber, '--------------------')

        // console.log('--------------------', data, '--------------------')



        packet = packet.concat(checksum, this.endByte);

        return packet.join("");

    }


    getVerifyRowPacket(arrayId, rowNumber) {

        let packet = [];

        const splittedRow = this.swap16String(rowNumber).match(/.{1,2}/g);

        const dataLength = (data.length / 2) + 3; // +3 is for start packet, end packet, and command

        let splittedDataLength = this.swap16String(dataLength.toString(16).padStart(4, '0'));

        splittedDataLength = splittedDataLength.match(/.{1,2}/g);


        packet[0] = '01';
        packet[1] = '3A';
        packet[2] = splittedDataLength[0];
        packet[3] = splittedDataLength[1];
        packet[4] = arrayId;
        packet[5] = splittedRow[0];
        packet[6] = splittedRow[1];

        const splittedData = data.match(/.{1,2}/g);

        packet = packet.concat(splittedData);


        const checksum = this.calculateChecksumString(packet);
        packet = packet.concat(checksum, this.endByte);

        return packet.join("");
    }

    getVerifyChecksum() {

        let packet = [];

        packet[0] = '01';
        packet[1] = '31';
        packet[2] = '00';
        packet[3] = '00';
        packet[4] = 'CE';
        packet[5] = 'FF';
        packet[6] = '17';

        return packet.join("");
    }

    getExitBootLoader() {

        let packet = [];

        packet[0] = '01';
        packet[1] = '3B';
        packet[4] = '00';
        packet[5] = '00';
        packet[6] = 'C4';
        packet[7] = 'FF';
        packet[8] = '17';

        return packet.join("");
    }


    createBleTelegram(msgId, data) {

        let MSG_VERSION = 0x01;

    }

}

