import ActorBootPacket from "../../ActorBootPacket/index.js";

export default class WriteRowDataPacket extends ActorBootPacket {



    constructor(data, rowNumber, arrayId) {


        function swap16String(string) {
            const stringArr = string.split("");
            return `${stringArr[2]}${stringArr[3]}${stringArr[0]}${stringArr[1]}`
        }



        function calcChecksum(message) {

            let sum = 0;

            for (let i = 0; i < message.length; i++) {
                sum += message[i];
            }

            let crc = (1 + (~sum & 0xFFFF)) & 0xFFFF;

            if (crc > 65535) { crc = crc - 65535 - 1; }

            return crc;

        };


        function calculateChecksumString(command) {

            let checksum = calcChecksum(command.map(s => parseInt(s, 16)))

            checksum = swap16String(checksum.toString(16));

            return Buffer.from(checksum, 'hex').toString('hex');

        }

        let packet = [];

        let endByte = "17";

        const splittedRow = swap16String(rowNumber).match(/.{1,2}/g);

        const dataLength = (data.length / 2) + 3; // +3 is for start packet, end packet, and command

        let splittedDataLength = swap16String(dataLength.toString(16).padStart(4, '0'));

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

        const checksum = calculateChecksumString(packet);

        packet = packet.concat(checksum, endByte);

        super(packet.join("").toUpperCase())

    }

}