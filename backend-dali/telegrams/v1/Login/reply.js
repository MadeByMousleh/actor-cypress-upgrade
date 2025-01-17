

export default class LoginTelegramReply {


    result = {
        NACK: '00',
        ACK: '01',
        PINCODE_REQUIRED: '02',
        LOGIN_ACK_OPEN_PERIOD: '03'
    }

    protocolVersion = {
        fieldSize: 1,
        description: `Protocol version`,
        value: null
    }

    telegramType = {
        fieldSize: 2,
        description: "Telegram type",
        value: '1100',
    };

    totalLength = {
        fieldSize: 2,
        description: "Total length",
        value: null
    }

    crc16 = {
        fieldSize: 2,
        description: "CRC 16 value",
        value: null,
    }

    data = {
        fieldSize: 1,
        description: "Login result",
        value: null,
    }



    // constructor(reply) {

    //     let replyArray = reply.match(/.{2}/g);

    //     Object.values(this).forEach((field) => {

    //         if (field.fieldSize === null) {
    //             field.value = replyArray.splice(0, Number(`0x${this.dataLength.value.reverse().join("")}`))
    //             field.fieldSize = field.value.length;
    //         }

    //         else {
    //             field.value = replyArray.splice(0, field.fieldSize)
    //         }
    //     })
    // }

    constructor() {

    }


    isAck(value) {
        console.log(value)

        let telegramType = value.substring(2, 6);

        let result = value.substring(14, 16);

        if (telegramType === "1100") {
            return (result === this.result.ACK) || (result === this.result.LOGIN_ACK_OPEN_PERIOD);
        }

        return false;
    }

    isAccepted() {

        if (this.telegramType.value.join("") === "1100") {
            let value = this.data.value.join()

            return (value === this.result.ACK) || (value === this.result.LOGIN_ACK_OPEN_PERIOD);
        }
        return false;

    }

}