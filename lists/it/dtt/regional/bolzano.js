import videomedia from "../../../../sources/videomedia";
import blue from "../../../../sources/blue";
import tv33 from "../../../../sources/tv33";
import digitalbitrate from "../../../../sources/digitalbitrate";
import ètv from "../../../../sources/ètv";
import softwarecreation from "../../../../sources/softwarecreation";

export default {
    videomedia: { fetch: videomedia, channels: ["C", "E"] },
    blue: { fetch: blue, channels: [381, 25, 55, 205, 256, 286, 342, 1502, 414, 654, 147, 28, 228, 6, 26, 417, 307, 142, 656, 659, 658, 303, 302, 1222, 399, 401, 369, 367, 356, 357] },
    tv33: { fetch: tv33, channels: ["trentino", "alto-adige"] },
    digitalbitrate: { fetch: digitalbitrate, channels: ["tlu/TLU_CH34_25"] },
    ètv: { fetch: ètv, channels: ["Palinsesto_Marche"] },
    softwarecreation: { fetch: softwarecreation, channels: ["GoldTv", "LazioTv"] }
};