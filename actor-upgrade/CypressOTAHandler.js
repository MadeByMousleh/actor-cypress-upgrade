import DFUController from './DFUManager/DFUController.js'




export default class CypressOTAHandler {

    mac = ""
    onWrite = () => { }
    onRead = () => { }
    onResponse = () => { }
    payloadPath = ""
    onProgress = 0
    securityKey = null
    chunkLength = 130
    payload = null;
    otaController = new DFUController();

  

    constructor(mac, onWrite, onRead, payloadPath, securityKey = null, chunkLength = 130) {

        this.mac = mac;

        this.onWrite = onWrite

        this.onRead = onRead;

        this.payloadPath = payloadPath;

        this.securityKey = securityKey;

        this.chunkLength = chunkLength;

        this.otaController = new DFUController(this.payloadPath, this.onWrite, this.onRead, this.mac, this.onProgress, this.securityKey, this.chunkLength);

    }


    startOTA() {

        this.otaController.startDFU();
    }

    onResponse(cb) {
        this.otaController.eventEmitter.on("response", cb)
    }

    onProgress(cb) {
        this.otaController.eventEmitter.on("progress", cb)
    }

    onWrite(cb) {
        this.otaController.eventEmitter.on("progress", cb)
    }

}