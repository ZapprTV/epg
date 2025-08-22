import { DateTime } from "luxon";
import log from "../utils/logger";
import { parseHTML } from "linkedom";
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
        
        if (existingCache && existingCache["telerent"] && existingCache["telerent"][channels[channel]]) {
            log("generating", { source: "telerent", channel: channels[channel], day: "N/A - Cachato" });
            epg[channels[channel]] = existingCache["telerent"][channels[channel]];
            log("generating-done", { source: "telerent", channel: channels[channel], day: "N/A - Cachato" });
        } else {
            epg[channels[channel]] = [];

            log("generating", { source: "telerent", channel: channels[channel], day: "N/A" });
            await fetch(`http://95.255.213.243/vod/EPG/${channels[channel]}`)
                .then(response => response.text())
                .then(async html => {
                    const { document } = parseHTML(html);

                    epg[channels[channel]] = [...epg[channels[channel]], ...Array.from(document.querySelectorAll("Event")).flatMap(entry => {
                        const startDate = DateTime.fromFormat(entry.querySelector("StartDate").textContent, "yyyy-MM-dd").setZone("Europe/Rome").startOf("day");
                        const endDate = DateTime.fromFormat(entry.querySelector("EndDate").textContent, "yyyy-MM-dd").setZone("Europe/Rome").startOf("day");
                        const startTime = startDate.set({
                            hour: entry.querySelector("StartTime").textContent.split(":")[0],
                            minutes: entry.querySelector("StartTime").textContent.split(":")[1],
                            seconds: entry.querySelector("StartTime").textContent.split(":")[2]
                        });
                        const endTime = endDate.set({
                            hour: entry.querySelector("EndTime").textContent.split(":")[0],
                            minutes: entry.querySelector("EndTime").textContent.split(":")[1],
                            seconds: entry.querySelector("EndTime").textContent.split(":")[2]
                        });

                        let name;
                        if (entry.querySelector("Descrizione").textContent.trim() === entry.querySelector("Descrizione").textContent.trim().toUpperCase()) {
                            name = entry.querySelector("Descrizione").textContent.trim().split(" ").map(el => el.slice(0, 1) + el.slice(1).toLowerCase()).join(" ");
                        } else name = entry.querySelector("Descrizione").textContent.trim();

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
                        if (entry.querySelector("Episodio") && entry.querySelector("Episodio").textContent && entry.querySelector("Episodio").textContent.trim()) result.description = entry.querySelector("Episodio").textContent.trim();

                        return result;
                    })];
                    log("generating-done", { source: "telerent", channel: channels[channel], day: "N/A" });
                    await fs.writeFile(
                        path.join(__dirname, "../.epg-cache.json"),
                        JSON.stringify(merge({}, existingCache, {
                            telerent: epg
                        }), null, 4)
                    );
                })
                .catch(err => log("generating-fail", { source: "telerent", channel: channels[channel], day: "N/A", error: err }));
        };
    };
    log("spacer", { width: 66 });

    return epg;
};