import uvotv from "../../../../sources/it/uvotv";
import digitalbitrate from "../../../../sources/it/digitalbitrate";
import lacplay from "../../../../sources/it/lacplay";
import oggiintv from "../../../../sources/it/oggiintv";

export default {
    uvotv: { fetch: uvotv, channels: ["Video Calabria_it", "TEN TV_it", "Calabria TV.tvprofil_it", "TELEMIA_it", "Tele Dehon_it", "Icaro TV_it", "TELERADIOPACE 1_it", "Video Touring.tvprofil_it"] },
    digitalbitrate: { fetch: digitalbitrate, channels: ["tca/TCA_CH32_9807"] },
    lacplay: { fetch: lacplay, channels: ["lac-tv", "lac-onair", "lac_network"] },
    oggiintv: { fetch: oggiintv, channels: ["Telepace"] }
};