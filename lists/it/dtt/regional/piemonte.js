import digitalbitrate from "../../../../sources/it/digitalbitrate";
import blue from "../../../../sources/it/blue";
import lacplay from "../../../../sources/it/lacplay";
import publirose from "../../../../sources/it/publirose";

export default {
    digitalbitrate: { fetch: digitalbitrate, channels: ["tlu/TLU_CH21_1008", "tro/TRO_CH27_6803", "tlu/TLU_CH21_1004"] },
    blue: { fetch: blue, channels: [2057, 1667] },
    lacplay: { fetch: lacplay, channels: ["lac-tv"] },
    publirose: { fetch: publirose, channels: ["telereporter"] }
};