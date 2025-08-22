import { DateTime } from "luxon";
import log from "../utils/logger";
import { merge } from "lodash";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default async function fetchEPG(channels) {
    let epg = {};

    for (const channel in channels) {
        let existingCache = {};
        try {
            const data = await fs.readFile(path.join(__dirname, "../.epg-cache.json"), "utf-8");
            existingCache = JSON.parse(data);
        } catch { };
        
        if (existingCache && existingCache["oggiintv"] && existingCache["oggiintv"][channels[channel]]) {
            log("generating", { source: "oggiintv", channel: channels[channel], day: "N/A - Cachato" });
            epg[channels[channel]] = existingCache["oggiintv"][channels[channel]];
            log("generating-done", { source: "oggiintv", channel: channels[channel], day: "N/A - Cachato" });
        } else {
            epg[channels[channel]] = [];
            for (const daysToAdd in [...Array(7).keys()]) {
                const day = DateTime.now().setZone("Europe/Rome").plus({ days: parseInt(daysToAdd) }).startOf("day");
                const date = day.toFormat("yyyy-MM-dd");
    
                log("generating", { source: "oggiintv", channel: channels[channel], day: date });
                await fetch(`https://cdn-oggi-in-tv.zefiroapp.com/v8/tv-guide/for/${channels[channel]}/${date}`)
                    .then(response => response.json())
                    .then(async json => {
                        epg[channels[channel]] = [...epg[channels[channel]], ...json.flatMap((entry, index) => {
                            const startTime = DateTime.fromSeconds(entry.startTime).setZone("Europe/Rome");
                            const endTime = DateTime.fromSeconds(entry.endTime).setZone("Europe/Rome");

                            let result = {
                                name: entry.title,
                                startTime: {
                                    unix: startTime.ts,
                                    iso: startTime.toISO()
                                },
                                endTime: {
                                    unix: endTime.ts,
                                    iso: endTime.toISO()
                                }
                            };
                            if (entry.description && entry.description.trim()) result.description = entry.description.trim();

                            return result;
                        })];
                        log("generating-done", { source: "oggiintv", channel: channels[channel], day: date });
                        await fs.writeFile(
                            path.join(__dirname, "../.epg-cache.json"),
                            JSON.stringify(merge({}, existingCache, {
                                oggiintv: epg
                            }), null, 4)
                        );
                    })
                    .catch(err => log("generating-fail", { source: "oggiintv", channel: channels[channel], day: date, error: err }));
            };
        };
        log("spacer", { width: 70 });
    };

    return epg;
};