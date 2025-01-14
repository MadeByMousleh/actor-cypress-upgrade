import ActorBootPacket from "../../wygwamPackets/ActorBootPacket/index.js";


export default class VerifyChecksumPacket extends ActorBootPacket {

    constructor() {

        let packet = [];

        packet[0] = '01';
        packet[1] = '31';
        packet[2] = '00';
        packet[3] = '00';
        packet[4] = 'CE';
        packet[5] = 'FF';
        packet[6] = '17';

        super(packet.join("").toUpperCase())
    }


}