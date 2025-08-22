import tdbnet from "../../../../sources/tdbnet";
import digitalbitrate from "../../../../sources/digitalbitrate";

export default {
    tdbnet: { fetch: tdbnet, channels: ["T4", "TV12", "A3"] },
    digitalbitrate: { fetch: digitalbitrate, channels: ["tlu/TLU_CH34_25"] }
};