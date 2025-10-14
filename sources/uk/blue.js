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
        
        if (existingCache && existingCache["blue"] && existingCache["blue"][channels[channel]]) {
            log("generating", { source: "blue", channel: channels[channel], day: "N/A - Cached", language: "en" });
            epg[channels[channel]] = existingCache["blue"][channels[channel]];
            log("generating-done", { source: "blue", channel: channels[channel], day: "N/A - Cached", language: "en" });
        } else {
            epg[channels[channel]] = [];
            const startDate = DateTime.now().setZone("Europe/London").minus({ days: 1 });
            const endDate = DateTime.now().setZone("Europe/London").plus({ days: 7 }).toFormat("yyyyMMdd0000");
            
            let timeshift = 0;
            if (/^[0-9]{1,}\+[0-9.]{1,}$/g.test(channels[channel])) {
                timeshift = parseFloat(channels[channel].split("+")[1]);
            };
            let id = timeshift ? channels[channel].split("+")[0] : channels[channel];

            log("generating", { source: "blue", channel: channels[channel], day: `${startDate.toFormat("yyyyMMdd0000")} - ${endDate}`, language: "en" });
            await fetch(`https://services.sg101.prd.sctv.ch/catalog/tv/channels/list/(ids=${id};start=${startDate.toFormat("yyyyMMdd0000")};end=${endDate};level=normal)`)
                .then(response => response.json())
                .then(async json => {
                    epg[channels[channel]] = json.Nodes.Items[0].Content.Nodes.Items.flatMap(entry => {
                        const endTime = DateTime.fromISO(entry.Availabilities[0].AvailabilityEnd).setZone("Europe/London").plus({ hours: timeshift });
                        const today = DateTime.now().setZone("Europe/London").startOf("day");
                        if (today.ts <= endTime.ts) {
                            const startTime = DateTime.fromISO(entry.Availabilities[0].AvailabilityStart).setZone("Europe/London").plus({ hours: timeshift });
                            let result = {
                                name: entry.Content.Description.Title,
                                startTime: {
                                    unix: startTime.ts,
                                    iso: startTime.toISO()
                                },
                                endTime: {
                                    unix: endTime.ts,
                                    iso: endTime.toISO()
                                }
                            };
    
                            if (entry.Content.Description.Summary && entry.Content.Description.Summary.trim()) result.description = entry.Content.Description.Summary.trim();
                            if (entry.Content.Series) {
                                if (entry.Content.Series.Episode) result.episode = entry.Content.Series.Episode;
                                if (entry.Content.Series.Season) result.season = entry.Content.Series.Season;
                            };
                            if (entry.Content.Nodes && entry.Content.Nodes.Items && entry.Content.Nodes.Items.filter(image => image.Role === "Lane").length > 0) result.image = `https://services.sg101.prd.sctv.ch/content/images/${entry.Content.Nodes.Items.filter(image => image.Role === "Lane")[0].ContentPath.trim()}_w1920.webp`;
                            if (entry.Content.Description.AgeRestrictionRating && entry.Content.Description.AgeRestrictionRating != "0+") {
                                const colors = {
                                    "6+": {
                                        background: "#ffe842",
                                        text: "#000"
                                    },
                                    "12+": {
                                        background: "#33b540",
                                        text: "#fff"
                                    },
                                    "16+": {
                                        background: "#38a7e4",
                                        text: "#fff"
                                    },
                                    "18+": {
                                        background: "#ed1c24",
                                        text: "#fff"
                                    }
                                };
                                result.rating = {
                                    label: entry.Content.Description.AgeRestrictionRating,
                                    ...colors[entry.Content.Description.AgeRestrictionRating]
                                };
                            };
    
                            return result;
                        } else return [];
                    });
                    log("generating-done", { source: "blue", channel: channels[channel], day: `${startDate.toFormat("yyyyMMdd0000")} - ${endDate}`, language: "en" });
                    await fs.writeFile(
                        path.join(__dirname, "../../.epg-cache.json"),
                        JSON.stringify(merge({}, existingCache, {
                            blue: epg
                        }), null, 4)
                    );
                })
                .catch(err => log("generating-fail", { source: "blue", channel: channels[channel], day: `${startDate.toFormat("yyyyMMdd0000")} - ${endDate}`, error: err, language: "en" }));
        };
    };
    log("spacer", { width: 79 });

    return epg;
};