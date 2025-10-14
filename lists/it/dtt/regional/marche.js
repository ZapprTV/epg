import veratv from "../../../../sources/it/veratv";
import ètv from "../../../../sources/it/ètv";
import tv33 from "../../../../sources/it/tv33";
import digitalbitrate from "../../../../sources/it/digitalbitrate";
import softwarecreation from "../../../../sources/it/softwarecreation";

export default {
    veratv: { fetch: veratv, channels: ["Get_ApiAppMarcheSchedules"] },
    ètv: { fetch: ètv, channels: ["Palinsesto_Marche"] },
    tv33: { fetch: tv33, channels: ["alto-adige"] },
    digitalbitrate: { fetch: digitalbitrate, channels: ["tlu/TLU_CH34_25"] },
    softwarecreation: { fetch: softwarecreation, channels: ["GoldTv", "LazioTv"] }
};