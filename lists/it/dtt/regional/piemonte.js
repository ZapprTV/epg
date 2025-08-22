import digitalbitrate from "../../../../sources/digitalbitrate";
import blue from "../../../../sources/blue";
import lacplay from "../../../../sources/lacplay";
import publirose from "../../../../sources/publirose";

export default {
    digitalbitrate: { fetch: digitalbitrate, channels: ["tlu/TLU_CH21_1008", "tro/TRO_CH27_6803"] },
    blue: { fetch: blue, channels: [2057, 1667] },
    lacplay: { fetch: lacplay, channels: ["lac-tv"] },
    publirose: { fetch: publirose, channels: ["telereporter"] }
};