import digitalbitrate from "../../../../sources/it/digitalbitrate";
import lacplay from "../../../../sources/it/lacplay";
import oggiintv from "../../../../sources/it/oggiintv";

export default {
    digitalbitrate: { fetch: digitalbitrate, channels: ["tca/TCA_CH32_9801", "tca/TCA_CH32_9803", "tca/TCA_CH32_9812", "tca/TCA_CH32_9818"] },
    lacplay: { fetch: lacplay, channels: ["lac-tv", "lac-onair", "lac_network"] },
    oggiintv: { fetch: oggiintv, channels: ["Telepace"] }
};