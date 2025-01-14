import Telegram from "../telegrams/v1/Telegram.js";
import TelegramHeader from "../telegrams/v1/TelegramHeader.js";

export default class TelegramHelper {

    createProtocolVersion(protocolVersion) {
        // console.log(protocolVersion > 0xff, 'PP');
        if (!protocolVersion) throw new Error("The protocol version cannot be null");
        if (protocolVersion > 0xff) throw new Error("The protocol version cannot be greater then 1 byte or 128 in decimal")
        return protocolVersion;
    }

    createTelegramType(telegramType) {
        if (!telegramType) throw new Error("The protocol version cannot be null");
        if (telegramType > 0xffff) throw new Error("The protocol version cannot be greater then 1 byte or 128 in decimal")
        return telegramType;
    }

    createTotalLength(totalLength) {
        if (!totalLength) throw new Error("The protocol version cannot be null");
        if (totalLength > 256) throw new Error("The protocol version cannot be greater then 1 byte or 128 in decimal")
        return totalLength;
    }

    createCrc16(crc16) {
        if (!crc16) throw new Error("The protocol version cannot be null");
        if (crc16 > 256) throw new Error("The protocol version cannot be greater then 1 byte or 128 in decimal")
        return crc16;
    }

    calcCrc16(message, crc = 0x8005, poly = 0x1021) {

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


    createTelegramField(byteNumber, fieldSize, value, description) {
        return {
            byteNumber,
            fieldSize,
            value: value ?? null,
            description
        }
    }

    createTelegram(t) {
        const telegramHeader = new TelegramHeader(t.protocolVersion, t.telegramType, t.totalLength);
        const telegram = new Telegram(telegramHeader, t.payload);

        return telegram.getBytes.toUpperCase();
    }

    createTelegramFromHexString(t) {
        const telegramHeader = new TelegramHeader(t.protocolVersion, t.telegramType, t.totalLength);
        let headerHex = telegramHeader.bytes.toString('hex');
        let result = headerHex + t.payload;
        return result;
    }


    swapBytes(bytes) {
        return [bytes >> 8, bytes & 0xff];
    }

    split16Bytes(byte16) {
        let low = byte16 & 0xff;
        let high = byte16 >> 8;

        return Uint8Array.from([high, low]);

    }

    getHexByteLength(hexString)
    {
        return hexString.length / 2;
    }
}