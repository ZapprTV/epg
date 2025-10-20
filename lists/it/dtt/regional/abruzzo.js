import uvotv from "../../../../sources/it/uvotv";
import veratv from "../../../../sources/it/veratv";
import digitalbitrate from "../../../../sources/it/digitalbitrate";

export default {
    uvotv: { fetch: uvotv, channels: ["Telemolise.tvprofil_it", "TVSEI.tvprofil_it"] },
    veratv: { fetch: veratv, channels: ["Get_ApiAppMarcheSchedules", "Get_ApiAppAbruzzoSchedules"] },
    digitalbitrate: { fetch: digitalbitrate, channels: ["tro/TRO_CH27_6803"] },
};