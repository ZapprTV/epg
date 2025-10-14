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
        
        if (existingCache && existingCache["sky"] && existingCache["sky"][channels[channel]]) {
            log("generating", { source: "sky", channel: channels[channel], day: "N/A - Cachato" });
            epg[channels[channel]] = existingCache["sky"][channels[channel]];
            log("generating-done", { source: "sky", channel: channels[channel], day: "N/A - Cachato" });
        } else {
            epg[channels[channel]] = [];
            for (const daysToAdd in [...Array(7).keys()]) {
                const startDate = DateTime.now().setZone("Europe/Rome").plus({ days: parseInt(daysToAdd) }).startOf("day").setZone("GMT").toISO();
                const endDate = DateTime.now().setZone("Europe/Rome").plus({ days: parseInt(daysToAdd) + 1 }).startOf("day").setZone("GMT").toISO();
    
                log("generating", { source: "sky", channel: channels[channel], day: `${startDate} - ${endDate}` });
                await fetch(`https://apid.sky.it/gtv/v1/events?from=${startDate}&to=${endDate}&pageSize=999&pageNum=0&env=DTH&channels=${channels[channel]}`)
                    .then(response => response.json())
                    .then(async json => {
                        epg[channels[channel]] = [...epg[channels[channel]], ...json.events.flatMap(entry => {
                            const startTime = DateTime.fromISO(entry.starttime).setZone("Europe/Rome");
                            const endTime = DateTime.fromISO(entry.endtime).setZone("Europe/Rome");
                            const today = DateTime.now().setZone("Europe/Rome").startOf("day");
                            if (today.ts <= endTime.ts) {
                                let name;
                                if (entry.epgEventTitle === entry.epgEventTitle.toUpperCase()) {
                                    name = entry.epgEventTitle.split(" ").map(el => el.slice(0, 1) + el.slice(1).toLowerCase()).join(" ");
                                } else name = entry.epgEventTitle;
    
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
                                if (entry.eventSynopsis && entry.eventSynopsis.trim()) result.description = entry.eventSynopsis.trim();
        
                                return result;
                            } else return [];
                        })];
                        log("generating-done", { source: "sky", channel: channels[channel], day: `${startDate} - ${endDate}` });
                        await fs.writeFile(
                            path.join(__dirname, "../../.epg-cache.json"),
                            JSON.stringify(merge({}, existingCache, {
                                sky: epg
                            }), null, 4)
                        );
                    })
                    .catch(err => log("generating-fail", { source: "sky", channel: channels[channel], day: `${startDate} - ${endDate}`, error: err }));
            };
        };
        log("spacer", { width: 102 });
    };

    return epg;
};