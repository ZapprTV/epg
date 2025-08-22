import blue from "../../../../sources/blue";
import tdbnet from "../../../../sources/tdbnet";
import digitalbitrate from "../../../../sources/digitalbitrate";
import tv33 from "../../../../sources/tv33";

export default {
    blue: { fetch: blue, channels: [2057, 303, 302, 1222] },
    tdbnet: { fetch: tdbnet, channels: ["A3"] },
    digitalbitrate: { fetch: digitalbitrate, channels: ["tlu/TLU_CH34_25"] },
    tv33: { fetch: tv33, channels: ["trentino", "alto-adige"] }
};