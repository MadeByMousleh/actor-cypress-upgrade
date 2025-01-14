export default class ActorBootPacketReply {

    constructor(reply) {

        const replyArray = reply.match(/.{2}/g);

        this.protocolVersion = this.createField(1, 'Protocol version', replyArray);
        this.telegramType = this.createField(2, 'Telegram type', replyArray);
        this.totalLength = this.createField(2, 'Total length', replyArray);
        this.crc16 = this.createField(2, 'CRC 16 value', replyArray);
        this.startOfPacket = this.createField(1, 'Start of cypress boot-loader packet', replyArray);
        this.statusCode = this.createField(1, 'Status code of cypress packet', replyArray);
        this.dataLength = this.createField(2, 'Data length of cypress packet', replyArray);
        this.data = {
            fieldSize: this.getDataFieldSize(),
            description: 'Data of cypress packet',
            value: replyArray.splice(0, this.getDataFieldSize()),
        };
        this.checksum = this.createField(2, 'Checksum of cypress packet', replyArray);
        this.endOfPacket = this.createField(1, 'End of cypress packet', replyArray);
    }

    createField(fieldSize, description, replyArray) {
        const value = replyArray.splice(0, fieldSize);
        return {
            fieldSize: fieldSize,
            description: description,
            value: value,
        };
    }

    getDataFieldSize() {
        return parseInt(this.dataLength.value.reverse().join(''), 16);
    }

    isAccepted() {
        return this.statusCode.value.join('') === '00';
    }
}
