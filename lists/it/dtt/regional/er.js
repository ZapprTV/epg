import ètv from "../../../../sources/ètv";
import softwarecreation from "../../../../sources/softwarecreation";
import selftv from "../../../../sources/selftv";
import digitalbitrate from "../../../../sources/digitalbitrate";
import oggiintv from "../../../../sources/oggiintv";
import tv33 from "../../../../sources/tv33";
import publirose from "../../../../sources/publirose";

export default {
    ètv: { fetch: ètv, channels: ["Palinsesto_Marche"] },
    softwarecreation: { fetch: softwarecreation, channels: ["GoldTv", "LazioTv"] },
    selftv: { fetch: selftv, channels: ["trmedia/eventsmo", "trmedia/eventsbo"] },
    digitalbitrate: { fetch: digitalbitrate, channels: ["tca/TCA_CH32_9818", "tlu/TLU_CH34_25"] },
    oggiintv: { fetch: oggiintv, channels: ["Telepace"] },
    tv33: { fetch: tv33, channels: ["alto-adige"] },
    publirose: { fetch: publirose, channels: ["telereporter"] }
};