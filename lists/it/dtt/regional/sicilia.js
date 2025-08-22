import digitalbitrate from "../../../../sources/digitalbitrate";
import telerent from "../../../../sources/telerent";

export default {
    digitalbitrate: { fetch: digitalbitrate, channels: ["tsa/TSA_CH42_90", "tsa/TSA_CH42_93", "tca/TCA_CH32_9801"] },
    telerent: { fetch: telerent, channels: ["EPG.Xml", "EPG_TVM.xml"] }
};