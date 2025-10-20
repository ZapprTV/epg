import rtv38 from "../../../../sources/it/rtv38";
import softwarecreation from "../../../../sources/it/softwarecreation";
import uvotv from "../../../../sources/it/uvotv";
import oggiintv from "../../../../sources/it/oggiintv";

export default {
    rtv38: { fetch: rtv38, channels: ["RTV38"] },
    softwarecreation: { fetch: softwarecreation, channels: ["GoldTv", "LazioTv"] },
    uvotv: { fetch: uvotv, channels: ["Tele Dehon_it", "Icaro TV_it", "TELERADIOPACE 1_it", "TRENTINO_it", "Radio BRUNO.tvprofile_it"] },
    oggiintv: { fetch: oggiintv, channels: ["Telepace"] }
};