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




async function connectToDevice(nodeMac) {
    try {
        const response = await fetch(`http://192.168.40.1/gap/nodes/${nodeMac}/connection`, {
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

async function sendLoginTelegram(nodeMac) {
    try {
        const response = await fetch(`http://192.168.40.1/gatt/nodes/${nodeMac}/handle/19/value/0110000900FB951D01?noresponse=1`, {
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
                    if (id.toUpperCase() === nodeMac.toUpperCase()) {
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

async function sendJumpToBootTelegram(nodeMac, application = "02") {
    try {
        const response = await fetch(`http://192.168.40.1/gatt/nodes/${nodeMac}/handle/19/value/0101000800D9CB${application}?noresponse=1`, {
            method: 'GET',
        });

        return response.status === 200;
    } catch (error) {
        console.error('Error in sendJumpToBootTelegram', error);
        return false;
    }
}

async function getActorBootState(nodeMac) {
    try {
        const response = await fetch(`http://192.168.40.1/gatt/nodes/${nodeMac}/handle/19/value/0117000700D9E7?noresponse=1`, {
            method: 'GET',
        });

        if (response.status === 200) {
            return new Promise((resolve) => {
                evReply.onmessage = (msg) => {
                    const { id, value } = JSON.parse(msg.data);
                    if (value.slice(2, 6) === "1800" && id.toUpperCase() === nodeMac.toUpperCase()) {
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

async function startDFUProcess(mac) {

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

    const state = await getActorBootState(mac);

    console.log("Result of actor boot state", state === '02' ? 'BOOT': "APPLICATION");

    if (state !== '01') return;


    const otaHandler = new CypressOTAHandler(mac, sendDataChunk, (cb) => responseEvent.on('response', cb), PAYLOAD_PATH, null, 130);

    otaHandler.startOTA();
}

async function sendDataChunk(chunk, nodeMac) {
    try {
        const url = `http://192.168.40.1/gatt/nodes/${nodeMac}/handle/19/value/${chunk}?noresponse=1`;
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


app.post('/upgrade-start', (req, res) => {
    const { mac } = req.body;
    startDFUProcess(mac).catch(console.error);
    res.status(200).send('Upgrade process started');

});

app.listen(9999, () => {
    console.log('Events service started at http://localhost:9999');
});
