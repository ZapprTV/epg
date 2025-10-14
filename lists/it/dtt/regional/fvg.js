import tdbnet from "../../../../sources/it/tdbnet";
import videomedia from "../../../../sources/it/videomedia";
import softwarecreation from "../../../../sources/it/softwarecreation";
import digitalbitrate from "../../../../sources/it/digitalbitrate";

export default {
    tdbnet: { fetch: tdbnet, channels: ["T4", "TV12", "A3"] },
    videomedia: { fetch: videomedia, channels: ["C", "E"] },
    softwarecreation: { fetch: softwarecreation, channels: ["GoldTv", "LazioTv"] },
    digitalbitrate: { fetch: digitalbitrate, channels: ["tlu/TLU_CH34_25"] }
};