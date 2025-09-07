import raiplay from "../../../sources/raiplay";
import blue from "../../../sources/blue";
import mediaset from "../../../sources/mediaset";
import raiplaysound from "../../../sources/raiplaysound";
import tivu from "../../../sources/tivu";
import sky from "../../../sources/sky";
import publirose from "../../../sources/publirose";
import cusano from "../../../sources/cusano";
import superguidatv from "../../../sources/superguidatv";
import samsungtvplus from "../../../sources/samsungtvplus";
import rtl from "../../../sources/rtl";
import set from "../../../sources/set";
import digitalbitrate from "../../../sources/digitalbitrate";
import plutotv from "../../../sources/plutotv";

export default {
    raiplay: { fetch: raiplay, channels: ["rai-1", "rai-2", "rai-3", "rai-4", "rai-5", "rai-movie", "rai-premium", "rai-gulp", "rai-yoyo", "rai-news-24", "rai-storia", "rai-scuola", "rai-sport", "rai-radio-2"] },
    blue: { fetch: blue, channels: [348, 79, 215, 237, 266, 118, 1379, 214, 96, 1948, 633, 239, 243, 346, 1348, 1665, 1346, 1489, 2015, 191, 613, 51, 225, 189, 84, 412, 216, 393, 1287, 137, 257, 1646, 1384, 1387, 2049, 2054, 1386, 16, 1641, 80, 2066, 1951, 1719, 101, 183, 1639, 390] },
    mediaset: { fetch: mediaset, channels: ["ER", "EC", "EW"] },
    raiplaysound: { fetch: raiplaysound, channels: ["rai-radio-1", "rai-radio-2", "rai-radio-3", "rai-isoradio", "rai-radio-3-classica", "rai-radio-kids", "rai-radio-live-napoli", "rai-radio-techete", "rai-radio-tutta-italiana", "rai-radio-1-sport", "no-name-radio"] },
    tivu: { fetch: tivu, channels: [130, 136, 255] },
    sky: { fetch: sky, channels: [9099, 308, 8293] },
    publirose: { fetch: publirose, channels: ["telecampione"] },
    cusano: { fetch: cusano, channels: ["canale122", "radiocusanocampus"] },
    superguidatv: { fetch: superguidatv, channels: [1284191387, 464] },
    samsungtvplus: { fetch: samsungtvplus, channels: ["*"] },
    rtl: { fetch: rtl, channels: ["radiofreccia", "radiozeta"] },
    set: { fetch: set, channels: ["italiachannel", "padrepiotv", "fascinotv", "radioroma", "tci", "rtr99", "radioradio"] },
    digitalbitrate: { fetch: digitalbitrate, channels: ["tlu/TLU_CH22_2010", "tca/TCA_CH32_9807"] },
    plutotv: { fetch: plutotv, channels: ["*"] }
};