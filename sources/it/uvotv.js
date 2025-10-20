import { DateTime } from "luxon";
import log from "../../utils/logger";
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
            const data = await fs.readFile(path.join(__dirname, "../../.epg-cache.json"), "utf-8");
            existingCache = JSON.parse(data);
        } catch { };
        
        if (existingCache && existingCache["uvotv"] && existingCache["uvotv"][channels[channel]]) {
            log("generating", { source: "uvotv", channel: channels[channel], day: "N/A - Cachato" });
            epg[channels[channel]] = existingCache["uvotv"][channels[channel]];
            log("generating-done", { source: "uvotv", channel: channels[channel], day: "N/A - Cachato" });
        } else {
            epg[channels[channel]] = [];
            const startDate = DateTime.now().startOf("day").setZone("UTC").toISO({ suppressMilliseconds: true });
            const endDate = DateTime.now().startOf("day").plus({ days: 7 }).setZone("UTC").toISO({ suppressMilliseconds: true });
            
            log("generating", { source: "uvotv", channel: channels[channel], day: `${startDate} - ${endDate}` });
            await fetch(`https://uvotv.com/api/web/live-channels/programmes`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    channelEpgIds: [channels[channel]],
                    fromDate: startDate,
                    toDate: endDate
                })
            })
                .then(response => response.json())
                .then(async json => {
                    epg[channels[channel]] = json[channels[channel]].flatMap(entry => {
                        if (entry.title && entry.title.trim() && entry.title.trim() != "N/A" && entry.description != "Program $displayName" && entry.description != "Nuk ka informacion") {
                            let name;
                            if (entry.title.trim() === entry.title.trim().toUpperCase()) {
                                name = entry.title.trim().split(" ").map(el => el.slice(0, 1) + el.slice(1).toLowerCase()).join(" ");
                            } else name = entry.title.trim();
                            const startTime = DateTime.fromISO(entry.start).setZone("Europe/Rome");
                            const endTime = DateTime.fromISO(entry.stop).setZone("Europe/Rome");
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
    
                            if (entry.description && entry.description.trim() && entry.description.trim() != "N/A") result.description = entry.description.trim();
                            if (entry.subtitle && entry.subtitle.trim() && entry.subtitle.trim() != "N/A") result.subtitle = entry.subtitle.trim();

                            return result;
                        } else return [];
                    });
                    log("generating-done", { source: "uvotv", channel: channels[channel], day: `${startDate} - ${endDate}` });
                    await fs.writeFile(
                        path.join(__dirname, "../../.epg-cache.json"),
                        JSON.stringify(merge({}, existingCache, {
                            uvotv: epg
                        }), null, 4)
                    );
                })
                .catch(err => log("generating-fail", { source: "uvotv", channel: channels[channel], day: `${startDate} - ${endDate}`, error: err }));
        };
    };
    log("spacer", { width: 123 });

    return epg;
};