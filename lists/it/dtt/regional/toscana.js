import rtv38 from "../../../../sources/rtv38";
import softwarecreation from "../../../../sources/softwarecreation";
import digitalbitrate from "../../../../sources/digitalbitrate";
import oggiintv from "../../../../sources/oggiintv";

export default {
    rtv38: { fetch: rtv38, channels: ["RTV38"] },
    softwarecreation: { fetch: softwarecreation, channels: ["GoldTv", "LazioTv"] },
    digitalbitrate: { fetch: digitalbitrate, channels: ["tca/TCA_CH32_9818"] },
    oggiintv: { fetch: oggiintv, channels: ["Telepace"] }
};