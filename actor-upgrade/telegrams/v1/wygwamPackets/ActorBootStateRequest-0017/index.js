import TelegramHelper from '../../../helpers/telegramHelper.js';

 export default class ActorBootStateRequestTelegram  {

    protocolVersion;
    telegramType;
    totalLength;
    payload;

    telegramHelper = new TelegramHelper();
    
    // Sensor 0x01 - Actor 0x02
    constructor() {
        this.telegramHelper = new TelegramHelper();
        this.protocolVersion =  this.telegramHelper.createProtocolVersion(0x01);
        this.telegramType = this.telegramHelper.createTelegramType(0x0017);
        this.totalLength = this.telegramHelper.createTelegramType(0x0007);
    }

     create()
    {
        return this.telegramHelper.createTelegram(this)
    }
}

