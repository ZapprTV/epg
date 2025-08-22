import blue from "../../../../sources/blue";
import digitalbitrate from "../../../../sources/digitalbitrate";
import tv33 from "../../../../sources/tv33";
import publirose from "../../../../sources/publirose";

export default {
    blue: { fetch: blue, channels: [1667, 1645, 593, 2113] },
    digitalbitrate: { fetch: digitalbitrate, channels: ["tlu/TLU_CH22_2003", "tlu/TLU_CH22_2005", "tlu/TLU_CH34_25", "tlu/TLU_CH34_31", "tlu/TLU_CH34_30", "tlu/TLU_CH22_2014"] },
    tv33: { fetch: tv33, channels: ["alto-adige"] },
    publirose: { fetch: publirose, channels: ["telereporter"] }
};