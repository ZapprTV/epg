import canaledieci from "../../../../sources/canaledieci";
import digitalbitrate from "../../../../sources/digitalbitrate";
import oggiintv from "../../../../sources/oggiintv";

export default {
    canaledieci: { fetch: canaledieci, channels: ["canale-dieci"] },
    digitalbitrate: { fetch: digitalbitrate, channels: ["tro/TRO_CH27_6803"] },
    oggiintv: { fetch: oggiintv, channels: ["Telepace"] }
};