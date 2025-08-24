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
        
        if (existingCache && existingCache["softwarecreation"] && existingCache["softwarecreation"][channels[channel]]) {
            log("generating", { source: "softwarecreation", channel: channels[channel], day: "N/A - Cachato" });
            epg[channels[channel]] = existingCache["softwarecreation"][channels[channel]];
            log("generating-done", { source: "softwarecreation", channel: channels[channel], day: "N/A - Cachato" });
        } else {
            epg[channels[channel]] = [];

            log("generating", { source: "softwarecreation", channel: channels[channel], day: "N/A" });
            await fetch(`https://www.softwarecreation.it/testxml/${channels[channel]}.xml`)
                .then(response => response.text())
                .then(async html => {
                    const { document } = parseHTML(html);

                    epg[channels[channel]] = [...epg[channels[channel]], ...Array.from(document.querySelectorAll("EVENT")).flatMap((entry, index) => {
                        if (index != Array.from(document.querySelectorAll("EVENT")).length - 1) {
                            const startTime = DateTime.fromISO(entry.getAttribute("time")).setZone("Europe/Rome");
                            const endTime = DateTime.fromISO(Array.from(document.querySelectorAll("EVENT"))[index + 1].getAttribute("time")).setZone("Europe/Rome");

                            let name;
                            if (entry.querySelector("NAME").textContent.trim() === entry.querySelector("NAME").textContent.trim().toUpperCase()) {
                                name = entry.querySelector("NAME").textContent.trim().split(" ").map(el => el.slice(0, 1) + el.slice(1).toLowerCase()).join(" ");
                            } else name = entry.querySelector("NAME").textContent.trim();

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
                            if (entry.querySelector("DESCRIPTION") && entry.querySelector("DESCRIPTION").textContent && entry.querySelector("DESCRIPTION").textContent.trim()) result.description = entry.querySelector("DESCRIPTION").textContent.trim();

                            return result;
                        } else return [];
                    })];
                    log("generating-done", { source: "softwarecreation", channel: channels[channel], day: "N/A" });
                    await fs.writeFile(
                        path.join(__dirname, "../.epg-cache.json"),
                        JSON.stringify(merge({}, existingCache, {
                            softwarecreation: epg
                        }), null, 4)
                    );
                })
                .catch(err => log("generating-fail", { source: "softwarecreation", channel: channels[channel], day: "N/A", error: err }));
        };
    };
    log("spacer", { width: 70 });

    return epg;
};