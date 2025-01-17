import { readFile } from 'fs/promises';  // Async version of fs module
import bodyParser from 'body-parser';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import EventSource from 'eventsource';
import LoginTelegramReply from './telegrams/v1/Login/reply.js';
import ActorBootStateRequestReply from './telegrams/v1/ActorBootStateRequest-0017/reply.js';
import EventEmitter from 'events';
import CypressOTAHandler from '../actor-upgrade/CypressOTAHandler.js';

const PAYLOAD_PATH = './firmwares/P47/0227/353AP20227.cyacd';

dotenv.config();

const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200,
};

const app = express();

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors(corsOptions));

const evReply = new EventSource('http://192.168.40.1/gatt/nodes?event=1');

const dfuControllerEvent = new EventSource('http://192.168.40.1/gatt/nodes?event=1');

let DFUControllers = {};




async function connectToDevice(mac) {
    try {
        const response = await fetch(`http://192.168.40.1/gap/nodes/${mac}/connection`, {
            method: 'POST',
            headers: {
                'Accept': '*/*',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                timeout: 10000,
                type: 'public',
                discovergatt: 0,
            }),
        });

        return response.status === 200;
    } catch (e) {
        console.error('Error in connection - Failed in connectToDevice', e);
        return false;
    }
}

async function sendLoginTelegram(mac) {
    try {
        const response = await fetch(`http://192.168.40.1/gatt/nodes/${mac}/handle/19/value/0110000900FB951D01?noresponse=1`, {
            method: 'GET',
            headers: {
                'Accept': '*/*',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        if (response.status === 200) {
            return new Promise((resolve) => {
                evReply.onmessage = (msg) => {
                    const { id, value } = JSON.parse(msg.data);
                    if (id.toUpperCase() === mac.toUpperCase()) {
                        const loginReplyPacket = new LoginTelegramReply();
                        return resolve(loginReplyPacket.isAck(value));
                    }
                };
            });
        }
        return false;
    } catch (error) {
        console.error('Error in sendLoginTelegram', error);
        return false;
    }
}


async function getActorBootState(mac) {
    try {
        const response = await fetch(`http://192.168.40.1/gatt/nodes/${mac}/handle/19/value/0117000700D9E7?noresponse=1`, {
            method: 'GET',
        });

        if (response.status === 200) {
            return new Promise((resolve) => {
                evReply.onmessage = (msg) => {
                    const { id, value } = JSON.parse(msg.data);
                    if (value.slice(2, 6) === "1800" && id.toUpperCase() === mac.toUpperCase()) {
                        const reply = new ActorBootStateRequestReply(value);
                        resolve(reply.data.value.join(""));
                    }
                };
            });
        }
        return null;
    } catch (error) {
        console.error('Error in getActorBootState', error);
        return null;
    }
}

let responseEvent = new EventEmitter();


const onprogress = (progress) => {

    console.log(progress);
}

function delay(ms = 2000) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


evReply.onmessage = (msg) => {

    let { id, value, handle } = JSON.parse(msg.data);

    if (handle === 14) {

        let bufferData = new Buffer.from(value, 'hex');

        return DFUControllers[id].onResponse(bufferData);
    }

    else {

        dataEmitter.emit(id, value);

    }


}


async function sendJumpToBootTelegram(mac, application = "01") {
    try {
        const response = await fetch(`http://192.168.40.1/gatt/nodes/${mac}/handle/19/value/0101000800D9CB${application}?noresponse=1`);

        console.log(response)

        if (response.status === 200) {
            return true;
        }

        // Return `false` for unexpected status codes
        console.error(`Unexpected status code: ${response.status}`);
        return false;
    } catch (error) {
        console.error(`Error sending JumpToBootTelegram: ${error.message}`);
        return false;
    }
}


async function openNotification(mac) {

    const result = await fetch(`http://192.168.40.1/gatt/nodes/${mac}/handle/15/value/0100`)

    const resultData = result;

    if (resultData.status === 200) {
        return true;
    }

    console.log("Failed on opening notification")
    return false;

}


const checkIfHandleIsThere = async (mac) => {

    if (!mac || typeof mac !== "string") {
        console.error("Invalid MAC address provided");
        return false;
    }

    try {
        const response = await fetch(`http://192.168.40.1/gatt/nodes/${mac}/characteristics/00060001-f8ce-11e4-abf4-0002a5d5c51b/descriptors`);

        console.log(response.status)

        if (response.status === 200) {

            return !Array.isArray(response.json)

        } else {
            console.error(`Unexpected status code: ${response.status}`);
            return false;
        }
    } catch (error) {
        console.error(`Error fetching data for MAC address ${mac}:`, error.message);
        return false;
    }
};



const makeActorReadyForProgramming = async (mac) => {
    console.log("Trying to connect")

    const connected = await connectToDevice(mac);

    if (!connected) return;

    console.log("Connected")


    console.log("Trying to login");

    const isLoggedIn = await sendLoginTelegram(mac);


    if (!isLoggedIn) return;

    console.log("Logged in to the detector");

    console.log("Trying to jump to actor boot");


    const isJumpedToBoot = await sendJumpToBootTelegram(mac);

    if (!isJumpedToBoot) return;

    console.log("Jumped to actor boot");

    console.log("Checking the actor boot state");

    await delay();

    const state = await getActorBootState(mac);

    console.log("Result of actor boot state", state === '01' ? 'BOOT' : "APPLICATION");

    return state === '01' ? true : false;
}


const makeSensorReadyForProgramming = async (mac) => {

    console.log("Starting process to make sensor ready for programming...\n");

    const connectionResult = await connectToDevice(mac);
    if (!connectionResult) {
        console.error(`Failed to connect to device with MAC address ${mac}. Status: ${connectionResult.status}`);
        return;
    }

    console.log("Connected to device...\n");

    const isInBoot = await checkIfHandleIsThere(mac);

    if (isInBoot) {
        console.log("Device is already in boot mode...\n");
        await handleAlreadyInBoot(mac);
        return;
    }

    let isLoggedIn = await sendLoginTelegram(mac)

    if (isLoggedIn) {
        console.log("Logged into device...\n");
        await attemptJumpToBoot(mac);
        return;
    }

    console.log("Login failed, attempting to handle already in boot mode...\n");

};




async function attemptJumpToBoot(mac, retries = 3) {

    for (let attempt = 1; attempt <= retries; attempt++) {

        console.log(`Attempting to jump to boot mode. Retry ${attempt} of ${retries}...`);

        const jumpedToBoot = await sendJumpToBootTelegram(mac, '01');

        if (jumpedToBoot) {

            console.log("Successfully jumped to boot mode... \n");

            console.log("Disconnected automatically... \n");

            // Wait for 5 seconds before reconnecting
            console.log("Waiting for 5 seconds....")

            await delay(5000)

            console.log("Reconnecting to device...\n");

            const reconnectResult = await connectToDevice(mac);

            if (reconnectResult.status !== 200) {

                console.error(`Failed to reconnect to device with MAC address ${mac}. Status: ${reconnectResult.status}`);
                return;
            }

            console.log("Reconnected successfully... \n");

            // Check again if the device is in boot mode
            checkIfHandleIsThere(mac, async (isInBootNow) => {
                if (!isInBootNow) {
                    console.log("Device is not in boot mode after reconnecting.\n");
                    return;
                }

                console.log("Device is now in boot mode... \n");

                const notificationOpen = await openNotification(mac);
                if (!notificationOpen) {
                    console.error("Failed to open notifications.\n");
                    return;
                }

                console.log("Notifications opened...\n");
                startDFU(mac);
            });

            return;
        }

        console.log(`Jump to boot attempt ${attempt} failed. Retrying in 5 seconds...`);
        await delay(5000);
    }

    console.error("Failed to jump to boot mode after multiple attempts.");
}

async function handleAlreadyInBoot(mac) {

    const notificationOpen = await openNotification(mac);
    if (!notificationOpen) {
        console.error("Failed to open notifications.\n");
        return;
    }
    console.log("Notifications opened...\n");
    startDFU(mac);

}

const startDFU = (mac) => {

    const otaHandler = new CypressOTAHandler(mac, sendDataChunk, (cb) => responseEvent.on('response', data => cb(data)), PAYLOAD_PATH, "49A134B6C779", 256);

    console.log("Starting OTA")

    otaHandler.startOTA();

    otaHandler.onWrite(data => {
        console.log(data, "From onWrite")
    })


    otaHandler.onResponse(data => {
        console.log(data, "From Response")
    })

    otaHandler.onProgress(data => {
        console.log(data)
    })

    console.log("Starting dfu")
}

const makeReadyForProgramming = async (mac, actor = false,) => {

    if (!actor) {
        makeSensorReadyForProgramming(mac)
    }

    if (actor) {
        makeActorReadyForProgramming() && startDFUProcess(mac)
    }


}

async function startDFUProcess(mac, actor = false) {


    makeReadyForProgramming(mac, actor)


    await delay();

    // const otaHandler = new CypressOTAHandler(mac, sendDataChunk, (cb) => responseEvent.on('response', data => cb(data)), PAYLOAD_PATH, "49A134B6C779", 130);

    // const otaHandler = new CypressOTAHandler(mac, sendDataChunk, (cb) => responseEvent.on('response', data => cb(data)), PAYLOAD_PATH, "49A134B6C779", 256);

    // console.log("Starting OTA")

    // otaHandler.startOTA();

    // otaHandler.onWrite(data => {
    //     console.log(data, "From onWrite")
    // })


    // otaHandler.onResponse(data => {
    //     console.log(data, "From Response")
    // })

    // otaHandler.onProgress(data => {
    //     console.log(data)
    // })
}

async function sendDataChunk(chunk, mac) {

    try {
        const url = `http://192.168.40.1/gatt/nodes/${mac}/handle/19/value/${chunk}?noresponse=1`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': '*/*',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });



        if (!response.ok) {
            console.error(`Failed to send data chunk: ${response.statusText}`);
        }
    } catch (error) {
        console.error('Error while sending data chunk:', error);
    }
}

dfuControllerEvent.onmessage = (msg) => {

    const { id, value } = JSON.parse(msg.data);

    responseEvent.emit("response", value);

};


app.post('/upgrade-start', async (req, res) => {
    const { mac } = req.body;
    await startDFUProcess(mac).catch(console.error);
    res.status(200).send('Upgrade process started');

});

app.listen(9998, () => {
    console.log('Events service started at http://localhost:9999');
});
