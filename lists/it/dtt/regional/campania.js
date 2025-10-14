import digitalbitrate from "../../../../sources/it/digitalbitrate";
import oggiintv from "../../../../sources/it/oggiintv";

export default {
    digitalbitrate: { fetch: digitalbitrate, channels: ["nap/NAP_CH41_8001", "nap/NAP_CH41_8002", "nap/NAP_CH41_8005", "nap/NAP_CH41_8009", "nap/NAP_CH31_8031", "nap/NAP_CH34_12", "tca/TCA_CH32_9818"] },
    oggiintv: { fetch: oggiintv, channels: ["Telepace"] }
};