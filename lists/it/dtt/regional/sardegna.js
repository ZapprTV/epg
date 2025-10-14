import oggiintv from "../../../../sources/it/oggiintv";
import digitalbitrate from "../../../../sources/it/digitalbitrate";

export default {
    oggiintv: { fetch: oggiintv, channels: ["Telepace"] },
    digitalbitrate: { fetch: digitalbitrate, channels: ["tca/TCA_CH32_9818"] }
};