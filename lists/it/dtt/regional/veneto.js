import tdbnet from "../../../../sources/tdbnet";
import blue from "../../../../sources/blue";
import videomedia from "../../../../sources/videomedia";
import digitalbitrate from "../../../../sources/digitalbitrate";
import softwarecreation from "../../../../sources/softwarecreation";
import oggiintv from "../../../../sources/oggiintv";
import publirose from "../../../../sources/publirose";

export default {
    tdbnet: { fetch: tdbnet, channels: ["A3", "RV"] },
    blue: { fetch: blue, channels: [2057] },
    videomedia: { fetch: videomedia, channels: ["C", "E"] },
    digitalbitrate: { fetch: digitalbitrate, channels: ["tlu/TLU_CH34_25"] },
    softwarecreation: { fetch: softwarecreation, channels: ["GoldTv", "LazioTv"] },
    oggiintv: { fetch: oggiintv, channels: ["Telepace"] },
    publirose: { fetch: publirose, channels: ["telereporter"] }
};