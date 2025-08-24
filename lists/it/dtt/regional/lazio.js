import canaledieci from "../../../../sources/canaledieci";
import digitalbitrate from "../../../../sources/digitalbitrate";
import softwarecreation from "../../../../sources/softwarecreation";
import ètv from "../../../../sources/ètv";
import oggiintv from "../../../../sources/oggiintv";

export default {
    canaledieci: { fetch: canaledieci, channels: ["canale-dieci"] },
    digitalbitrate: { fetch: digitalbitrate, channels: ["tro/TRO_CH27_6803"] },
    softwarecreation: { fetch: softwarecreation, channels: ["GoldTv", "LazioTv"] },
    ètv: { fetch: ètv, channels: ["Palinsesto_Marche"] },
    oggiintv: { fetch: oggiintv, channels: ["Telepace"] }
};