import ètv from "../../../../sources/it/ètv";
import softwarecreation from "../../../../sources/it/softwarecreation";
import selftv from "../../../../sources/it/selftv";
import digitalbitrate from "../../../../sources/it/digitalbitrate";
import oggiintv from "../../../../sources/it/oggiintv";
import tv33 from "../../../../sources/it/tv33";
import publirose from "../../../../sources/it/publirose";

export default {
    ètv: { fetch: ètv, channels: ["Palinsesto_Marche"] },
    softwarecreation: { fetch: softwarecreation, channels: ["GoldTv", "LazioTv"] },
    // selftv: { fetch: selftv, channels: ["trmedia/eventsmo", "trmedia/eventsbo"] },
    digitalbitrate: { fetch: digitalbitrate, channels: ["tca/TCA_CH32_9818", "tlu/TLU_CH34_25"] },
    oggiintv: { fetch: oggiintv, channels: ["Telepace"] },
    tv33: { fetch: tv33, channels: ["alto-adige"] },
    publirose: { fetch: publirose, channels: ["telereporter"] }
};