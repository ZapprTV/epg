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
        
        if (existingCache && existingCache["cr1"] && existingCache["cr1"][channels[channel]]) {
            log("generating", { source: "cr1", channel: channels[channel], day: "N/A - Cachato" });
            epg[channels[channel]] = existingCache["cr1"][channels[channel]];
            log("generating-done", { source: "cr1", channel: channels[channel], day: "N/A - Cachato" });
        } else {
            epg[channels[channel]] = [];
            for (const daysToAdd in [...Array(7).keys()]) {
                const day = DateTime.now().setZone("Europe/Rome").plus({ days: parseInt(daysToAdd) }).startOf("day");
                const date = day.toFormat("yyyy-MM-dd");
    
                log("generating", { source: "cr1", channel: channels[channel], day: date });
                await fetch(`https://cr1.it/wp-json/wp/v2/palinsesto?date=${date}`)
                    .then(response => response.json())
                    .then(async json => {
                        epg[channels[channel]] = [...epg[channels[channel]], ...json.flatMap((entry, index) => {
                            const startTime = day.set({
                                hour: entry.hour,
                                minutes: entry.time
                            });
                            const endTime = index != json.length - 1 ? day.set({
                                hour: json[index + 1].hour,
                                minutes: json[index + 1].time
                            }) : day.plus({ days: 1 });

                            let name;
                            if (entry.title.trim() === entry.title.trim().toUpperCase()) {
                                name = entry.title.trim().split(" ").map(el => el.slice(0, 1) + el.slice(1).toLowerCase()).join(" ");
                            } else name = entry.title.trim();

                            let result = {
                                name: name,
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
                        log("generating-done", { source: "cr1", channel: channels[channel], day: date });
                        await fs.writeFile(
                            path.join(__dirname, "../.epg-cache.json"),
                            JSON.stringify(merge({}, existingCache, {
                                cr1: epg
                            }), null, 4)
                        );
                    })
                    .catch(err => log("generating-fail", { source: "cr1", channel: channels[channel], day: date, error: err }));
            };
        };
        log("spacer", { width: 61 });
    };

    return epg;
};