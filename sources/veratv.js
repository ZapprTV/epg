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
        
        if (existingCache && existingCache["veratv"] && existingCache["veratv"][channels[channel]]) {
            log("generating", { source: "veratv", channel: channels[channel], day: "N/A - Cachato" });
            epg[channels[channel]] = existingCache["veratv"][channels[channel]];
            log("generating-done", { source: "veratv", channel: channels[channel], day: "N/A - Cachato" });
        } else {
            epg[channels[channel]] = [];
            const today = DateTime.now().setZone("Europe/Rome").startOf("day");

            log("generating", { source: "veratv", channel: channels[channel], day: "N/A" });
            await fetch(`https://dashboard.veratv.it/api/ApiApp/${channels[channel]}`, {
                headers: {
                    "Authorization": "Basic dmVyYXR2YXBwOnlFQXRfbE9YQDhGUTlrNmhXbmky"
                }
            })
                .then(response => response.json())
                .then(async json => {
                    const weekday = DateTime.now().setLocale("it").localWeekday - 1;
                    const programs = Object.keys(json.week).filter((el, index) => index >= weekday).concat(Object.keys(json.week).filter((el, index) => index < weekday)).flatMap((el, index) => json.week[el].programs.map((entry, entryIndex) => { entry.day = index; if (entryIndex === 0) { entry.title = "Programmazione notturna"; }; return entry; }));

                    epg[channels[channel]] = [...epg[channels[channel]], ...programs.flatMap((entry, index) => {
                        const day = today.plus({ days: entry.day });

                        let startTime = day.set({
                            hour: DateTime.fromISO(entry.time).hour,
                            minutes: DateTime.fromISO(entry.time).minute
                        });
                        let endTime = index != programs.length - 1 ? today.plus({ days: programs[index + 1].day }).set({
                            hour: DateTime.fromISO(programs[index + 1].time).hour,
                            minutes: DateTime.fromISO(programs[index + 1].time).minute
                        }) : day.plus({ days: 1 });

                        if (endTime.hour === 23 && endTime.minute === 59) endTime = endTime.plus({ minute: 1 });

                        if (startTime.hour === 23 && startTime.minute === 59) {
                            startTime = startTime.plus({ minute: 1 });
                            endTime = endTime.plus({ hours: 1 });
                            if (index != programs.length - 1) programs[index + 1].time = DateTime.fromISO(programs[index + 1].time).plus({ hours: 1 }).toISO();
                        };

                        let name;
                        if (entry.title === entry.title.toUpperCase()) {
                            name = entry.title.split(" ").map(el => el.slice(0, 1) + el.slice(1).toLowerCase()).join(" ");
                        } else name = entry.title;

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
                    log("generating-done", { source: "veratv", channel: channels[channel], day: "N/A" });
                    await fs.writeFile(
                        path.join(__dirname, "../.epg-cache.json"),
                        JSON.stringify(merge({}, existingCache, {
                            veratv: epg
                        }), null, 4)
                    );
                })
                .catch(err => log("generating-fail", { source: "veratv", channel: channels[channel], day: "N/A", error: err }));
        };
    };
    log("spacer", { width: 78 });

    return epg;
};