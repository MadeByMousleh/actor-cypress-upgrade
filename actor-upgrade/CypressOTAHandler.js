import DFUController from './DFUManager/DFUController.js'




export default class CypressOTAHandler {

    mac = ""
    payloadPath = ""
    securityKey = null
    chunkLength = 130
    otaController;



    constructor(mac, onWrite, onRead, payloadPath, securityKey = null, chunkLength = 130) {
        console.log('*********************************')

        this.mac = mac;

        this.payloadPath = payloadPath;

        this.securityKey = securityKey;

        this.chunkLength = chunkLength;

        this.otaController = new DFUController(this.payloadPath, onWrite, this.mac, this.onProgress, this.securityKey, this.chunkLength);

        onRead(data => {
            this.otaController.onResponse(data);
        })

    }


    startOTA() {
        console.log("Payload", this.payloadPath)

        this.otaController.startDFU();
    }

    onResponse(cb) {
        this.otaController.eventEmitter.on("response", cb)
    }

    onProgress(cb) {
        this.otaController.eventEmitter.on("progress", cb)
    }

    onWrite(cb) {
        this.otaController.eventEmitter.on("write", cb)
    }

}