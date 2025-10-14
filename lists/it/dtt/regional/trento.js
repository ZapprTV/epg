import blue from "../../../../sources/it/blue";
import tdbnet from "../../../../sources/it/tdbnet";
import digitalbitrate from "../../../../sources/it/digitalbitrate";
import tv33 from "../../../../sources/it/tv33";
import ètv from "../../../../sources/it/ètv";
import softwarecreation from "../../../../sources/it/softwarecreation";
import videomedia from "../../../../sources/it/videomedia";

export default {
    blue: { fetch: blue, channels: [2057, 303, 302, 1222] },
    tdbnet: { fetch: tdbnet, channels: ["A3"] },
    digitalbitrate: { fetch: digitalbitrate, channels: ["tlu/TLU_CH34_25"] },
    tv33: { fetch: tv33, channels: ["trentino", "alto-adige"] },
    ètv: { fetch: ètv, channels: ["Palinsesto_Marche"] },
    softwarecreation: { fetch: softwarecreation, channels: ["GoldTv", "LazioTv"] },
    videomedia: { fetch: videomedia, channels: ["C", "E"] }
};