import oggiintv from "../../../../sources/oggiintv";
import digitalbitrate from "../../../../sources/digitalbitrate";
import blue from "../../../../sources/blue";
import publirose from "../../../../sources/publirose";
import tv33 from "../../../../sources/tv33";
import lacplay from "../../../../sources/lacplay";

export default {
    oggiintv: { fetch: oggiintv, channels: ["Telepace"] },
    digitalbitrate: { fetch: digitalbitrate, channels: ["tca/TCA_CH32_9818", "tlu/TLU_CH21_1008", "tlu/TLU_CH34_25", "tro/TRO_CH27_6803"] },
    blue: { fetch: blue, channels: [2057] },
    publirose: { fetch: publirose, channels: ["telereporter"] },
    tv33: { fetch: tv33, channels: ["alto-adige"] },
    lacplay: { fetch: lacplay, channels: ["lac-tv"] }
};