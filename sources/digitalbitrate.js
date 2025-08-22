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
        
        if (existingCache && existingCache["digitalbitrate"] && existingCache["digitalbitrate"][channels[channel]]) {
            log("generating", { source: "digitalbitrate", channel: channels[channel], day: "N/A - Cachato" });
            epg[channels[channel]] = existingCache["digitalbitrate"][channels[channel]];
            log("generating-done", { source: "digitalbitrate", channel: channels[channel], day: "N/A - Cachato" });
        } else {
            epg[channels[channel]] = [];
            let lastEntryEndDate;
            log("generating", { source: "digitalbitrate", channel: channels[channel], day: "N/A" });
            await fetch(`https://www.digitalbitrate.com/display_eit_schedule.php?file=./files/${channels[channel]}.html`)
                .then(response => response.text())
                .then(async html => {
                    const { document } = parseHTML(html);
                    epg[channels[channel]] = [...epg[channels[channel]], ...Array.from(document.querySelectorAll(`tr:not(:has([bgcolor="#DDDDDD"]))`)).flatMap((entry, index) => {
                        if (entry.children[4].innerText.trim()) {
                            const day = DateTime.fromFormat(entry.children[0].innerText, "dd/MM").setZone("Europe/Rome").startOf("day").set({ year: DateTime.now().year });
                            let startTime = day.set({
                                hour: entry.children[1].innerText.split(">")[0].split("h")[0],
                                minutes: entry.children[1].innerText.split(">")[0].split("h")[1]
                            });
                            if (lastEntryEndDate && index != 0 && startTime.ts < lastEntryEndDate) startTime = startTime.plus({ minutes: 1 });
                            let endTime = day.set({
                                hour: entry.children[1].innerText.split(">")[1].split("h")[0],
                                minutes: entry.children[1].innerText.split(">")[1].split("h")[1]
                            }).plus({ minutes: 1 });
                            if (startTime.ts > endTime.ts) endTime = endTime.plus({ days: 1 });
    
                            let name;
                            if (entry.children[4].innerText.trim() === entry.children[4].innerText.trim().toUpperCase()) {
                                name = entry.children[4].innerText.trim().split(" ").map(el => el.slice(0, 1) + el.slice(1).toLowerCase()).join(" ");
                            } else name = entry.children[4].innerText.trim();

                            name = name.replaceAll("", "");

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
                            if ((entry.children[5].innerText && entry.children[5].innerText.trim()) || (entry.children[7].innerText && entry.children[7].innerText.trim())) result.description = entry.children[5].innerText.trim() + entry.children[7].innerText.trim();
                            
                            lastEntryEndDate = endTime.ts;
    
                            return result;
                        } else return [];
                    })];
                    log("generating-done", { source: "digitalbitrate", channel: channels[channel], day: "N/A" });
                    await fs.writeFile(
                        path.join(__dirname, "../.epg-cache.json"),
                        JSON.stringify(merge({}, existingCache, {
                            digitalbitrate: epg
                        }), null, 4)
                    );
                })
                .catch(err => log("generating-fail", { source: "digitalbitrate", channel: channels[channel], day: "N/A", error: err }));
        };
    };
    log("spacer", { width: 78 });

    return epg;
};