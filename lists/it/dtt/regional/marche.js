import veratv from "../../../../sources/veratv";
import ètv from "../../../../sources/ètv";
import tv33 from "../../../../sources/tv33";
import digitalbitrate from "../../../../sources/digitalbitrate";
import softwarecreation from "../../../../sources/softwarecreation";

export default {
    veratv: { fetch: veratv, channels: ["Get_ApiAppMarcheSchedules"] },
    ètv: { fetch: ètv, channels: ["Palinsesto_Marche"] },
    tv33: { fetch: tv33, channels: ["alto-adige"] },
    digitalbitrate: { fetch: digitalbitrate, channels: ["tlu/TLU_CH34_25"] },
    softwarecreation: { fetch: softwarecreation, channels: ["GoldTv", "LazioTv"] }
};