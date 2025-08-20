import { DateTime } from "luxon";
import log from "../utils/logger";
let imageHost = "https://epg.zappr.stream";

export default async function fetchEPG(channels) {
    let epg = {};

    for (const channel in channels) {
        try {
            log("generating", { source: "set", channel: channels[channel], day: "N/A" });
            let json = await import(`./set/${channels[channel]}.json`);
            const weekday = DateTime.now().setLocale("it").localWeekday;
            epg[channels[channel]] = json.default.filter(dayEPG => dayEPG.day >= weekday).concat(json.default.filter(dayEPG => dayEPG.day < weekday)).flatMap((dayEPG, index) => dayEPG.entries.map(entry => {
                let startTime = DateTime.now().startOf("day").plus({ days: index }).set({ hour: entry.startTime.split(":")[0], minutes: entry.startTime.split(":")[1] }).setZone("Europe/Rome");
                let endTime = DateTime.now().startOf("day").plus({ days: index }).set({ hour: entry.endTime.split(":")[0], minutes: entry.endTime.split(":")[1] }).setZone("Europe/Rome");
                if (startTime.ts > endTime.ts) endTime = endTime.plus({ days: 1 });
                if (entry.image && entry.image.startsWith("/")) entry.image = `${imageHost}/set-images/${entry.image.slice(1, 2)}${entry.image}`;
                entry.startTime = {
                    unix: startTime.ts,
                    iso: startTime.toISO()
                };
                entry.endTime = {
                    unix: endTime.ts,
                    iso: endTime.toISO()
                };
                return entry;
            }));
            log("generating-done", { source: "set", channel: channels[channel], day: "N/A" });
        } catch (err) {
            log("generating-fail", { source: "set", channel: channels[channel], day: "N/A" });
        };
    };
    log("spacer", { width: 63 });

    return epg;
};