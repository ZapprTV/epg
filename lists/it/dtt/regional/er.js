import uvotv from "../../../../sources/it/uvotv";
import ètv from "../../../../sources/it/ètv";
import softwarecreation from "../../../../sources/it/softwarecreation";
import oggiintv from "../../../../sources/it/oggiintv";
import tv33 from "../../../../sources/it/tv33";
import publirose from "../../../../sources/it/publirose";

export default {
    uvotv: { fetch: uvotv, channels: ["eTV Rete 7.tvprofil_it", "TELECOLOR.tvprofil_it", "Tele Dehon_it", "TRC Modena.tvprofile_it", "7G_it", "TeleReggio.tvprofile_it", "teleromagna.tvprofile_it", "TRC Bologna.tvprofile_it", "12 TV Parma.tvprofile_it", "TV Qui.tvprofile_it", "Icaro TV_it", "TELERADIOPACE 1_it", "Telestense.tvprofile_it", "Radio BRUNO.tvprofile_it", "TELECOLOR.tvprofil_it", "eTV Rete 7.tvprofil_it", "VR.tvprofil_it"] },
    ètv: { fetch: ètv, channels: ["Palinsesto_Marche"] },
    softwarecreation: { fetch: softwarecreation, channels: ["GoldTv", "LazioTv"] },
    oggiintv: { fetch: oggiintv, channels: ["Telepace"] },
    tv33: { fetch: tv33, channels: ["alto-adige"] },
    publirose: { fetch: publirose, channels: ["telereporter"] }
};