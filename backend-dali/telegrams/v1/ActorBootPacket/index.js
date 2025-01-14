import TelegramHelper from '../../../helpers/telegramHelper.js';

 class ActorBootPacket  {

    protocolVersion;
    telegramType;
    totalLength;
    // crc16: number;
    payload;

    telegramHelper = new TelegramHelper();
    
    constructor(payload) {
        this.telegramHelper = new TelegramHelper();
        this.protocolVersion =  this.telegramHelper.createProtocolVersion(0x01);
        this.telegramType = this.telegramHelper.createTelegramType(0x0014);
        let actorMsgLength = ((payload.length / 2) + 7);
        this.totalLength = this.telegramHelper.createTelegramType(actorMsgLength);
        this.payload = payload;
    }

     create()
    {
        return this.telegramHelper.createTelegramFromHexString(this).toUpperCase()
    }
}

export default ActorBootPacket;

