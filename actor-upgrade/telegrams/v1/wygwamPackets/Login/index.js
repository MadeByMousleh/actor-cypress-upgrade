import TelegramHelper from '../../../helpers/telegramHelper.js';

 export default class LoginTelegram  {

    protocolVersion;
    telegramType;
    totalLength;
    payload;

    telegramHelper = new TelegramHelper();
    
    constructor() {
        this.telegramHelper = new TelegramHelper();
        this.protocolVersion =  this.telegramHelper.createProtocolVersion(0x01);
        this.telegramType = this.telegramHelper.createTelegramType(0x0014);
        this.totalLength = this.telegramHelper.createTelegramType(0x0009);
        this.payload = "011D";
    }

     create()
    {
        return this.telegramHelper.createTelegramFromHexString(this)
    }
}

