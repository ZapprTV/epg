import oggiintv from "../../../../sources/oggiintv";
import digitalbitrate from "../../../../sources/digitalbitrate";
import blue from "../../../../sources/blue";
import ètv from "../../../../sources/ètv";
import publirose from "../../../../sources/publirose";
import softwarecreation from "../../../../sources/softwarecreation";
import tv33 from "../../../../sources/tv33";
import lacplay from "../../../../sources/lacplay";

export default {
    oggiintv: { fetch: oggiintv, channels: ["Telepace"] },
    digitalbitrate: { fetch: digitalbitrate, channels: ["tca/TCA_CH32_9818", "tlu/TLU_CH21_1008", "tlu/TLU_CH34_25", "tro/TRO_CH27_6803"] },
    blue: { fetch: blue, channels: [2057] },
    ètv: { fetch: ètv, channels: ["Palinsesto_Marche"] },
    publirose: { fetch: publirose, channels: ["telereporter"] },
    softwarecreation: { fetch: softwarecreation, channels: ["GoldTv", "LazioTv"] },
    tv33: { fetch: tv33, channels: ["alto-adige"] },
    lacplay: { fetch: lacplay, channels: ["lac-tv"] }
};