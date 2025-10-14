import veratv from "../../../../sources/it/veratv";
import digitalbitrate from "../../../../sources/it/digitalbitrate";

export default {
    veratv: { fetch: veratv, channels: ["Get_ApiAppMarcheSchedules"] },
    digitalbitrate: { fetch: digitalbitrate, channels: ["tro/TRO_CH27_6803"] },
};