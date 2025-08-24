import veratv from "../../../../sources/veratv";
import digitalbitrate from "../../../../sources/digitalbitrate";

export default {
    veratv: { fetch: veratv, channels: ["Get_ApiAppMarcheSchedules"] },
    digitalbitrate: { fetch: digitalbitrate, channels: ["tro/TRO_CH27_6803"] },
};