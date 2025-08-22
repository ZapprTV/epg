import digitalbitrate from "../../../../sources/digitalbitrate";
import tv33 from "../../../../sources/tv33";

export default {
    digitalbitrate: { fetch: digitalbitrate, channels: ["tlu/TLU_CH34_25"] },
    tv33: { fetch: tv33, channels: ["alto-adige"] }
};