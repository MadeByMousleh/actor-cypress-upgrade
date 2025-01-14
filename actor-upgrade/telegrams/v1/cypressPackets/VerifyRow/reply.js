import ActorBootPacketReply from "../../wygwamPackets/ActorBootPacket/ActorBootPacketReply.js";


export default class VerifyRowPacketReply extends ActorBootPacketReply {


    constructor(reply) {
        super(reply);
    }


    isAccepted() {
        return this.statusCode.value.join("") === "00"
    }

}
