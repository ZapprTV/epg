import tdbnet from "../../../../sources/it/tdbnet";
import blue from "../../../../sources/it/blue";
import videomedia from "../../../../sources/it/videomedia";
import digitalbitrate from "../../../../sources/it/digitalbitrate";
import softwarecreation from "../../../../sources/it/softwarecreation";
import oggiintv from "../../../../sources/it/oggiintv";
import publirose from "../../../../sources/it/publirose";

export default {
    tdbnet: { fetch: tdbnet, channels: ["A3", "RV"] },
    blue: { fetch: blue, channels: [2057] },
    videomedia: { fetch: videomedia, channels: ["C", "E"] },
    digitalbitrate: { fetch: digitalbitrate, channels: ["tlu/TLU_CH34_25"] },
    softwarecreation: { fetch: softwarecreation, channels: ["GoldTv", "LazioTv"] },
    oggiintv: { fetch: oggiintv, channels: ["Telepace"] },
    publirose: { fetch: publirose, channels: ["telereporter"] }
};