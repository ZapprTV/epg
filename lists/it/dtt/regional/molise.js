import uvotv from "../../../../sources/it/uvotv";
import digitalbitrate from "../../../../sources/it/digitalbitrate";

export default {
    uvotv: { fetch: uvotv, channels: ["Telemolise.tvprofil_it", "TVSEI.tvprofil_it"] },
    digitalbitrate: { fetch: digitalbitrate, channels: ["tro/TRO_CH27_6803"] },
};