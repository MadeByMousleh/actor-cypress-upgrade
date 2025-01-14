
class TelegramHeader {
    _protocolVersion;
    _telegramType;
    _totalLength;
    _CRC16;
    _totalLength;
    bytes;


    constructor(protocolVersion, telegramType, totalLength) {
        this._protocolVersion = protocolVersion;
        this._telegramType = this.split16Bytes(telegramType).reverse();
        this._totalLength = this.split16Bytes(totalLength).reverse()
       
        this._CRC16 = this.split16Bytes(
            this.calculateCrc(
                Buffer.from([this._protocolVersion, ...this._telegramType, ...this._totalLength]))).reverse();

        this.bytes = Buffer.from([
            this._protocolVersion,
            ...this._telegramType,
            ...this._totalLength,
            ...this._CRC16]
        )

    }

    calculateCrc(message, crc = 0x8005, poly = 0x1021) {

        for (let i = 0; i < message.length; i++) {

            const s = message[i] << 8;

            crc = crc ^ s;
            // crc = crc & 0xFFFF;

            for (let j = 0; j < 8; j++) {

                if ((crc & 0x8000) > 0) {

                    crc = ((crc << 1) ^ poly);

                    crc = crc & 0xFFFF;
                }

                else {

                    crc <<= 1;
                }
            }
        }

        return crc;
    }

    swapBytes(bytes) {

    }

    split16Bytes(byte16) {
        let low = byte16 & 0xff;
        let high = byte16 >> 8;

        return Uint8Array.from([high, low]);

    }

}

export default TelegramHeader;