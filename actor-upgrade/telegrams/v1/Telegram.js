

export default class Telegram {
    _header;
    _payload;
    #bytes;

    constructor(header, payload) {
        this._header = header;
        this._payload = payload;
        this.#bytes = Uint8Array.from([...this._header.bytes, ...this._payload.reverse()]);
    }

    
    decimalToHex(d) {
        var h = (d).toString(16);
        return h.length % 2 ? '0' + h : h;
    }

    get getBytes() {
        let msg = "";
        this.#bytes.forEach(b => msg += this.decimalToHex(b))
        return msg;
    }
}
