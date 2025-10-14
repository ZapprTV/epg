import norba from "../../../../sources/it/norba";
import blue from "../../../../sources/it/blue";
import sky from "../../../../sources/it/sky";
import digitalbitrate from "../../../../sources/it/digitalbitrate";
import oggiintv from "../../../../sources/it/oggiintv";

export default {
    norba: { fetch: norba, channels: [11313512, 13292552] },
    blue: { fetch: blue, channels: [1499] },
    sky: { fetch: sky, channels: [9013] },
    digitalbitrate: { fetch: digitalbitrate, channels: ["tca/TCA_CH32_9818"] },
    oggiintv: { fetch: oggiintv, channels: ["Telepace"] }
};