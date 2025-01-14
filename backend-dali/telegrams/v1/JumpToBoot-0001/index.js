import TelegramHelper from '../../../helpers/telegramHelper.js';

 export default class JumpToBootTelegram  {

    protocolVersion;
    telegramType;
    totalLength;
    payload;

    telegramHelper = new TelegramHelper();
    
    // Sensor 0x01 - Actor 0x02
    constructor(application = "02") {
        this.telegramHelper = new TelegramHelper();
        this.protocolVersion =  this.telegramHelper.createProtocolVersion(0x01);
        this.telegramType = this.telegramHelper.createTelegramType(0x0001);
        this.totalLength = this.telegramHelper.createTelegramType(0x0008);
        this.payload = application;
    }

     create()
    {
        return this.telegramHelper.createTelegramFromHexString(this)
    }
}

