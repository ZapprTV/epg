import oggiintv from "../../../../sources/oggiintv";
import digitalbitrate from "../../../../sources/digitalbitrate";

export default {
    oggiintv: { fetch: oggiintv, channels: ["Telepace"] },
    digitalbitrate: { fetch: digitalbitrate, channels: ["tca/TCA_CH32_9818"] }
};