import uvotv from "../../../../sources/it/uvotv";
import veratv from "../../../../sources/it/veratv";
import ètv from "../../../../sources/it/ètv";
import tv33 from "../../../../sources/it/tv33";
import softwarecreation from "../../../../sources/it/softwarecreation";

export default {
    uvotv: { fetch: uvotv, channels: ["TV CENTRO MARCHE_it", "eTV Rete 7.tvprofil_it", "TELECOLOR.tvprofil_it", "TVRS.tvprofile_it", "7Gold Marche.tvprofile_it", "etv+ netweek.tvprofil_it", "FANO TV.tvprofil_it", "ROSSINI.tvprofil_it", "RTM.tvprofil_it"] },
    veratv: { fetch: veratv, channels: ["Get_ApiAppMarcheSchedules"] },
    ètv: { fetch: ètv, channels: ["Palinsesto_Marche"] },
    tv33: { fetch: tv33, channels: ["alto-adige"] },
    softwarecreation: { fetch: softwarecreation, channels: ["GoldTv", "LazioTv"] }
};