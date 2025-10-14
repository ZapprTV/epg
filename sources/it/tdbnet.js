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
        let nextDay = false;
        let existingCache = {};
        try {
            const data = await fs.readFile(path.join(__dirname, "../../.epg-cache.json"), "utf-8");
            existingCache = JSON.parse(data);
        } catch { };
        
        if (existingCache && existingCache["tdbnet"] && existingCache["tdbnet"][channels[channel]]) {
            log("generating", { source: "tdbnet", channel: channels[channel], day: "N/A - Cachato" });
            epg[channels[channel]] = existingCache["tdbnet"][channels[channel]];
            log("generating-done", { source: "tdbnet", channel: channels[channel], day: "N/A - Cachato" });
        } else {
            epg[channels[channel]] = [];
            const day = DateTime.now().setZone("Europe/Rome").startOf("day");

            log("generating", { source: "tdbnet", channel: channels[channel], day: "N/A" });
            await fetch(`https://www.tdbnet.it/_services/epgdata_for_app/${channels[channel]}.json`)
                .then(response => response.json())
                .then(async json => {
                    let entries = json.programs.filter(el => el.program.trim());
                    epg[channels[channel]] = [...epg[channels[channel]], ...entries.flatMap((entry, index) => {
                        if (index != entries.length - 1) {
                            let startTime = day.set({
                                hour: entry.time.split(":")[0],
                                minutes: entry.time.split(":")[1]
                            });
                            let endTime = day.set({
                                hour: entries[index + 1].time.split(":")[0],
                                minutes: entries[index + 1].time.split(":")[1]
                            });
                            if (nextDay) startTime = startTime.plus({ days: 1 });
                            if (startTime.ts > endTime.ts || nextDay) {
                                endTime = endTime.plus({ days: 1 });
                                nextDay = true;
                            };
    
                            let name;
                            if (entry.program === entry.program.toUpperCase()) {
                                name = entry.program.split(" ").map(el => el.slice(0, 1) + el.slice(1).toLowerCase()).join(" ");
                            } else name = entry.program;
    
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
                            if (entry.description && entry.description.trim()) {
                                if (entry.description.trim() === entry.description.trim().toUpperCase()) {
                                    result.description = entry.description.trim().slice(0, 1) + entry.description.trim().slice(1).toLowerCase();
                                } else result.description = entry.description.trim();
                            };
    
                            return result;
                        } else return [];
                    })];
                    log("generating-done", { source: "tdbnet", channel: channels[channel], day: "N/A" });
                    await fs.writeFile(
                        path.join(__dirname, "../../.epg-cache.json"),
                        JSON.stringify(merge({}, existingCache, {
                            tdbnet: epg
                        }), null, 4)
                    );
                })
                .catch(err => log("generating-fail", { source: "tdbnet", channel: channels[channel], day: "N/A", error: err }));
        };
    };
    log("spacer", { width: 57 });

    return epg;
};