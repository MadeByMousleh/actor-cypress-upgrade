import ActorBootPacket from "../../ActorBootPacket/index.js";


export default class GetFlashSizePacket extends ActorBootPacket {


    constructor() {

        // let packet = [];

        // packet[0] = '01';
        // packet[1] = '32';
        // packet[3] = '01';
        // packet[4] = '00';
        // packet[5] = '00';
        // packet[6] = 'CC';
        // packet[7] = 'FF';
        // packet[8] = '17';

        //  packet.join("");

        super("0132010000CCFF17");
    }


}