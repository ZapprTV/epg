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
            log("generating", { source: "sky", channel: channels[channel], day: "N/A - Cached", language: "en" });
            epg[channels[channel]] = existingCache["sky"][channels[channel]];
            log("generating-done", { source: "sky", channel: channels[channel], day: "N/A - Cached", language: "en" });
        } else {
            epg[channels[channel]] = [];
            for (const daysToAdd in [...Array(7).keys()]) {
                const date = DateTime.now().setZone("Europe/London").startOf("day").plus({ days: daysToAdd }).toFormat("yyyyMMdd");
    
                log("generating", { source: "sky", channel: channels[channel], day: date, language: "en" });
                await fetch(`https://awk.epgsky.com/hawk/linear/schedule/${date}/${channels[channel]}`)
                    .then(response => response.json())
                    .then(async json => {
                        epg[channels[channel]] = [...epg[channels[channel]], ...json.schedule[0].events.flatMap((entry, index) => {
                            let startTime = DateTime.fromSeconds(entry.st).setZone("Europe/London");
                            let endTime;
                            if (index != json.schedule[0].events.length - 1) {
                                endTime = DateTime.fromSeconds(json.schedule[0].events[index + 1].st).setZone("Europe/London");
                            } else endTime = DateTime.fromSeconds(entry.st + entry.d).setZone("Europe/London");

                            let result = {
                                name: entry.t,
                                startTime: {
                                    unix: startTime.ts,
                                    iso: startTime.toISO()
                                },
                                endTime: {
                                    unix: endTime.ts,
                                    iso: endTime.toISO()
                                }
                            };
                            if (entry.sy && entry.sy.trim()) result.description = entry.sy.trim();
                            if (entry.programmeuuid || entry.seasonuuid || entry.seriesuuid) result.image = `https://images.metadata.sky.com/pd-image/${entry.programmeuuid || entry.seasonuuid || entry.seriesuuid}/cover`;
                            if (entry.seasonnumber) result.season = entry.seasonnumber;
                            if (entry.episodenumber) result.episode = entry.episodenumber;
    
                            return result;
                        })];
                        log("generating-done", { source: "sky", channel: channels[channel], day: date, language: "en" });
                        await fs.writeFile(
                            path.join(__dirname, "../../.epg-cache.json"),
                            JSON.stringify(merge({}, existingCache, {
                                sky: epg
                            }), null, 4)
                        );
                    })
                    .catch(err => log("generating-fail", { source: "sky", channel: channels[channel], day: date, error: err, language: "en" }));
            };
        };
        log("spacer", { width: 57 });
    };

    return epg;
};