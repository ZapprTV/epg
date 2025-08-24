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
        
        if (existingCache && existingCache["videomedia"] && existingCache["videomedia"][channels[channel]]) {
            log("generating", { source: "videomedia", channel: channels[channel], day: "N/A - Cachato" });
            epg[channels[channel]] = existingCache["videomedia"][channels[channel]];
            log("generating-done", { source: "videomedia", channel: channels[channel], day: "N/A - Cachato" });
        } else {
            epg[channels[channel]] = [];
            let weekday = DateTime.now().setLocale("it").localWeekday - 1;
            
            for (const daysToAdd in [...Array(7).keys()]) {
                let nextDay = false;
                weekday = weekday + 1 <= 7 ? weekday + 1 : 1;
                const day = DateTime.now().plus({ days: daysToAdd }).setZone("Europe/Rome").startOf("day");

                log("generating", { source: "videomedia", channel: channels[channel], day: weekday });
                await fetch(`https://telechiara.gruppovideomedia.it/libs/services_jun18.php?method=jsonMapper.getTvSchedule&canale=${channels[channel]}&giorno=${weekday}`)
                    .then(response => response.json())
                    .then(async json => {
                        epg[channels[channel]] = [...epg[channels[channel]], ...json.content.flatMap((entry, index) => {
                            let startTime = day.set({
                                hour: entry[3].split(":")[0],
                                minutes: entry[3].split(":")[1],
                            });
                            let endTime = index != json.content.length - 1 ? day.set({
                                hour: json.content[index + 1][3].split(":")[0],
                                minutes: json.content[index + 1][3].split(":")[1],
                            }) : startTime.plus({ minutes: 15 });
                            
                            if (nextDay) startTime = startTime.plus({ days: 1 });
                            if (startTime.ts > endTime.ts || nextDay) {
                                endTime = endTime.plus({ days: 1 });
                                nextDay = true;
                            };
                            if (channels[channel] === "E") {
                                startTime = startTime.minus({ hours: 1 });
                                endTime = endTime.minus({ hours: 1 });
                            };

                            let name;
                            if (entry[5] && entry[5].trim()) name = `${entry[4]} - ${entry[5]}`
                            else name = entry[4];
                            
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
    
                            return result;
                        })];
                        log("generating-done", { source: "videomedia", channel: channels[channel], day: weekday });
                        await fs.writeFile(
                            path.join(__dirname, "../.epg-cache.json"),
                            JSON.stringify(merge({}, existingCache, {
                                videomedia: epg
                            }), null, 4)
                        );
                    })
                    .catch(err => log("generating-fail", { source: "videomedia", channel: channels[channel], day: weekday, error: err }));
            };
        };
        log("spacer", { width: 59 });
    };

    return epg;
};