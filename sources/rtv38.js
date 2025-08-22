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
        
        if (existingCache && existingCache["rtv38"] && existingCache["rtv38"][channels[channel]]) {
            log("generating", { source: "rtv38", channel: channels[channel], day: "N/A - Cachato" });
            epg[channels[channel]] = existingCache["rtv38"][channels[channel]];
            log("generating-done", { source: "rtv38", channel: channels[channel], day: "N/A - Cachato" });
        } else {
            epg[channels[channel]] = [];

            const startDate = DateTime.now().startOf("day").toFormat("yyyy-MM-dd");
            const endDate = DateTime.now().startOf("day").plus({ days: 6 }).toFormat("yyyy-MM-dd");
            log("generating", { source: "rtv38", channel: channels[channel], day: `${startDate}_${endDate}` });
            await fetch(`https://www.tg38.it/rtv38/palinsesto/${channels[channel]}_${startDate}_${endDate}.xml`)
                .then(response => response.text())
                .then(async html => {
                    const { document } = parseHTML(html);

                    epg[channels[channel]] = [...epg[channels[channel]], ...Array.from(document.querySelectorAll("Event")).flatMap((entry, index) => {
                        let startTime = DateTime.fromISO(entry.querySelector("StartTime").textContent).setZone("Europe/Rome");
                        let endTime;
                        if (index != Array.from(document.querySelectorAll("Event")).length - 1) {
                            endTime = DateTime.fromISO(Array.from(document.querySelectorAll("Event"))[index + 1].querySelector("StartTime").textContent).setZone("Europe/Rome");
                        } else {
                            endTime = startTime.plus({
                                hours: entry.querySelector("Duration").textContent.split(":")[0],
                                minutes: entry.querySelector("Duration").textContent.split(":")[1],
                                seconds: entry.querySelector("Duration").textContent.split(":")[2]
                            });
                        };

                        let name;
                        if (entry.querySelector("Title").textContent.trim() === entry.querySelector("Title").textContent.trim().toUpperCase()) {
                            name = entry.querySelector("Title").textContent.trim().split(" ").map(el => el.slice(0, 1) + el.slice(1).toLowerCase()).join(" ");
                        } else name = entry.querySelector("Title").textContent.trim();

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
                        if (entry.querySelector("Description") && entry.querySelector("Description").textContent && entry.querySelector("Description").textContent.trim()) {
                            if (entry.querySelector("Description").textContent.trim() === entry.querySelector("Description").textContent.trim().toUpperCase()) {
                                result.description = entry.querySelector("Description").textContent.trim().slice(0, 1) + entry.querySelector("Description").textContent.trim().slice(1).toLowerCase();
                            } else result.description = entry.querySelector("Description").textContent.trim();
                        };
                        if (entry.querySelector("AgeLimit") && entry.querySelector("AgeLimit").textContent && entry.querySelector("AgeLimit").textContent.trim()) {
                            result.rating = {
                                label: `${entry.querySelector("AgeLimit").textContent.trim()}+`,
                                background: "#ed1c24",
                                text: "#fff"
                            };
                        };

                        return result;
                    })];
                    log("generating-done", { source: "rtv38", channel: channels[channel], day: `${startDate}_${endDate}` });
                    await fs.writeFile(
                        path.join(__dirname, "../.epg-cache.json"),
                        JSON.stringify(merge({}, existingCache, {
                            rtv38: epg
                        }), null, 4)
                    );
                })
                .catch(err => log("generating-fail", { source: "rtv38", channel: channels[channel], day: `${startDate}_${endDate}`, error: err }));
        };
    };
    log("spacer", { width: 75 });

    return epg;
};