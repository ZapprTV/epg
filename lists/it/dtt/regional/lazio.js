import canaledieci from "../../../../sources/it/canaledieci";
import digitalbitrate from "../../../../sources/it/digitalbitrate";
import softwarecreation from "../../../../sources/it/softwarecreation";
import ètv from "../../../../sources/it/ètv";
import oggiintv from "../../../../sources/it/oggiintv";

export default {
    canaledieci: { fetch: canaledieci, channels: ["canale-dieci"] },
    digitalbitrate: { fetch: digitalbitrate, channels: ["tro/TRO_CH27_6803", "nap/NAP_CH41_8001"] },
    softwarecreation: { fetch: softwarecreation, channels: ["GoldTv", "LazioTv"] },
    ètv: { fetch: ètv, channels: ["Palinsesto_Marche"] },
    oggiintv: { fetch: oggiintv, channels: ["Telepace"] }
};