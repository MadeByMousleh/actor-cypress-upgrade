import ActorBootPacketReply from "../../ActorBootPacket/ActorBootPacketReply.js";


export default class SendDataPacketReply extends ActorBootPacketReply {


    constructor(reply) {
        super(reply);
    }


    isAccepted()
    {
        return this.statusCode.value.join("") === "00"
    }


}
