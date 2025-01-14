import ActorBootPacket from "../../ActorBootPacket/index.js";


export default class ExitBootLoaderPacket extends ActorBootPacket {

    constructor() {
        let packet = [];

        packet[0] = '01';
        packet[1] = '3B';
        packet[4] = '00';
        packet[5] = '00';
        packet[6] = 'C4';
        packet[7] = 'FF';
        packet[8] = '17';

        super(packet.join("").toUpperCase())
    }


}