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
        
        if (existingCache && existingCache["selftv"] && existingCache["selftv"][channels[channel]]) {
            log("generating", { source: "selftv", channel: channels[channel], day: "N/A - Cachato" });
            epg[channels[channel]] = existingCache["selftv"][channels[channel]];
            log("generating-done", { source: "selftv", channel: channels[channel], day: "N/A - Cachato" });
        } else {
            epg[channels[channel]] = [];

            log("generating", { source: "selftv", channel: channels[channel], day: "N/A" });
            await fetch(`https://selftv-epg-parser.selftv.video/${channels[channel].split("/")[0]}`)
                .then(response => response.json())
                .then(async json => {
                    epg[channels[channel]] = [...epg[channels[channel]], ...json.video[channels[channel].split("/")[1]].flatMap(entry => {
                        let startTime = DateTime.fromISO(entry.startTime).setZone("Europe/Rome");
                        let endTime = DateTime.fromISO(entry.endTime).setZone("Europe/Rome");

                        let name;
                        if (entry.name === entry.name.toUpperCase()) {
                            name = entry.name.split(" ").map(el => el.slice(0, 1) + el.slice(1).toLowerCase()).join(" ");
                        } else name = entry.name;

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
                    log("generating-done", { source: "selftv", channel: channels[channel], day: "N/A" });
                    await fs.writeFile(
                        path.join(__dirname, "../../.epg-cache.json"),
                        JSON.stringify(merge({}, existingCache, {
                            selftv: epg
                        }), null, 4)
                    );
                })
                .catch(err => log("generating-fail", { source: "selftv", channel: channels[channel], day: "N/A", error: err }));
        };
    };
    log("spacer", { width: 69 });

    return epg;
};