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
        
        if (existingCache && existingCache["lacplay"] && existingCache["lacplay"][channels[channel]]) {
            log("generating", { source: "lacplay", channel: channels[channel], day: "N/A - Cachato" });
            epg[channels[channel]] = existingCache["lacplay"][channels[channel]];
            log("generating-done", { source: "lacplay", channel: channels[channel], day: "N/A - Cachato" });
        } else {
            epg[channels[channel]] = [];
            for (const daysToAdd in [...Array(7).keys()]) {
                const today = DateTime.now().setZone("Europe/Rome").startOf("day").plus({ days: daysToAdd });
                const date = today.toFormat("yyyy/MM/dd");
                const day = today.toFormat("dd");

                log("generating", { source: "lacplay", channel: channels[channel], day: date });
                await fetch(`https://www.lacplay.it/partitions/v1_guide.php?data_pali=${date}&canale=${channels[channel]}&key=${day}`)
                    .then(response => response.text())
                    .then(async html => {
                        const { document } = parseHTML(`${html}</script>`);

                        let json;
                        await eval("json = " + document.querySelector("script:last-of-type").innerHTML.replaceAll("\r", "").replaceAll("\n", "").replaceAll("\t", "").replaceAll(/.*data: /g, "").replaceAll(/,selectedEvent.*/g, ""));

                        epg[channels[channel]] = [...epg[channels[channel]], ...json.events.flatMap((entry, index) => {
                            let { document: info } = parseHTML(`<body id="info">${entry.title}<span id="description">${entry.description ? entry.description.split("<br>").slice(0, -1).join("\n") : ""}</span></body>`);
                            let title;
                            if (info.querySelector("#info .jqTime-time")) {
                                title = info.querySelector("#info .jqTime-time").innerText;
                            } else return [];

                            let startTime = today.set({
                                hour: title.split(" - ")[0].split(":")[0],
                                minutes: title.split(" - ")[0].split(":")[1]
                            });
                            let endTime = today.set({
                                hour: title.split(" - ")[1].split(":")[0],
                                minutes: title.split(" - ")[1].split(":")[1]
                            });
                            if (endTime.hour === 23 && endTime.minute === 59) endTime = today.plus({ days: 1 });

                            let result = {
                                name: info.querySelector("#info .jqTime-title").innerText.trim(),
                                startTime: {
                                    unix: startTime.ts,
                                    iso: startTime.toISO()
                                },
                                endTime: {
                                    unix: endTime.ts,
                                    iso: endTime.toISO()
                                }
                            };
                            if (info.querySelector("#description").innerText.trim()) result.description = info.querySelector("#description").innerText.trim();
    
                            return result;
                        })];
                        log("generating-done", { source: "lacplay", channel: channels[channel], day: date });
                        await fs.writeFile(
                            path.join(__dirname, "../.epg-cache.json"),
                            JSON.stringify(merge({}, existingCache, {
                                lacplay: epg
                            }), null, 4)
                        );
                    })
                    .catch(err => log("generating-fail", { source: "lacplay", channel: channels[channel], day: date, error: err }));
            };
        };
        log("spacer", { width: 72 });
    };

    return epg;
};