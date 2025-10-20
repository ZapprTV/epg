import digitalbitrate from "../../../../sources/it/digitalbitrate";
import softwarecreation from "../../../../sources/it/softwarecreation";
import telerent from "../../../../sources/it/telerent";
import uvotv from "../../../../sources/it/uvotv";

export default {
    digitalbitrate: { fetch: digitalbitrate, channels: ["tsa/TSA_CH42_90", "tsa/TSA_CH42_93", "tsb/TSB_CH42_92"] },
    softwarecreation: { fetch: softwarecreation, channels: ["GoldTv", "LazioTv"] },
    telerent: { fetch: telerent, channels: ["EPG.Xml", "EPG_TVM.xml"] },
    uvotv: { fetch: uvotv, channels: ["Video Calabria_it"] }
};