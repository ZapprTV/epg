import tdbnet from "../../../../sources/tdbnet";
import blue from "../../../../sources/blue";
import digitalbitrate from "../../../../sources/digitalbitrate";
import oggiintv from "../../../../sources/oggiintv";
import publirose from "../../../../sources/publirose";

export default {
    tdbnet: { fetch: tdbnet, channels: ["A3", "RV"] },
    blue: { fetch: blue, channels: [2057] },
    digitalbitrate: { fetch: digitalbitrate, channels: ["tlu/TLU_CH34_25"] },
    oggiintv: { fetch: oggiintv, channels: ["Telepace"] },
    publirose: { fetch: publirose, channels: ["telereporter"] }
};