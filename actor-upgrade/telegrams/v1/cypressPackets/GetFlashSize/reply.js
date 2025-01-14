import ActorBootPacketReply from "../../wygwamPackets/ActorBootPacket/ActorBootPacketReply.js";


export default class GetFlashSizePacketReply extends ActorBootPacketReply {


    constructor(reply) {
        super(reply);
    }


    isAccepted()
    {
        return this.statusCode.value.join("") === "00"
    }

    getSize()
    {
        return this.data.value.join("");
    }
}
