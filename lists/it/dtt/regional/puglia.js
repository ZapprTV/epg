import norba from "../../../../sources/norba";
import blue from "../../../../sources/blue";
import sky from "../../../../sources/sky";
import digitalbitrate from "../../../../sources/digitalbitrate";
import oggiintv from "../../../../sources/oggiintv";

export default {
    norba: { fetch: norba, channels: [11313512, 13292552] },
    blue: { fetch: blue, channels: [1499] },
    sky: { fetch: sky, channels: [9013] },
    digitalbitrate: { fetch: digitalbitrate, channels: ["tca/TCA_CH32_9818", "tni/TNI_RAI-1B_1"] },
    oggiintv: { fetch: oggiintv, channels: ["Telepace"] }
};