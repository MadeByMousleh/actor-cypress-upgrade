import { readFile } from 'fs/promises';  // Async version of fs module
import DFUController from './DFUManager/DFUController.js'



export async function ActorDFUProcess(mac, onWriteData, onReadResponse, payloadPath, onProgress) {

    const payload = await readFile(payloadPath, 'utf8');

     let dfuManager = new DFUController(payload, onWriteData, mac, onProgress);

     onReadResponse(response => {

         dfuManager.onResponse(response)
     })

     dfuManager.startDFU();
}

