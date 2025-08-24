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
        
        if (existingCache && existingCache["ètv"] && existingCache["ètv"][channels[channel]]) {
            log("generating", { source: "ètv", channel: channels[channel], day: "N/A - Cachato" });
            epg[channels[channel]] = existingCache["ètv"][channels[channel]];
            log("generating-done", { source: "ètv", channel: channels[channel], day: "N/A - Cachato" });
        } else {
            epg[channels[channel]] = [];

            log("generating", { source: "ètv", channel: channels[channel], day: "N/A" });
            await fetch(`https://parseapi.back4app.com/classes/${channels[channel]}`, {
                method: "POST",
                body: JSON.stringify({
                    limit: "1000",
                    where: JSON.stringify({
                        Data: {
                            $gte: {
                                __type: "Date",
                                iso: DateTime.now().setZone("GMT").startOf("day").toISO()
                            }
                        }
                    }),
                    _method: "GET"
                }),
                headers: {
                    "X-Parse-Application-Id": "qLA1FXTCWzTa63lHmdxwvY0QxCIDRbaUap4V7Bhd",
                    "X-Parse-Client-Key": "biwsKE1Pzz17TqYbw7rXHSGhnBjDg67VINfeyURo",
                    "Content-Type": "application/json"
                }
            })
                .then(response => response.json())
                .then(async json => {
                    epg[channels[channel]] = [...epg[channels[channel]], ...json.results.flatMap((entry, index) => {
                        if (index != json.results.length - 1) {
                            const day = DateTime.fromISO(entry.Data.iso).setZone("Europe/Rome").startOf("day");

                            let startTime = day.set({
                                hour: entry.Ora.split(":")[0],
                                minutes: entry.Ora.split(":")[1]
                            });
                            if (startTime.hour === 0 && startTime.minute === 0) startTime = startTime.plus({ days: 1 });
                            let endTime = DateTime.fromISO(json.results[index + 1].Data.iso).setZone("Europe/Rome").startOf("day").set({
                                hour: json.results[index + 1].Ora.split(":")[0],
                                minutes: json.results[index + 1].Ora.split(":")[1]
                            });
                            if (startTime.ts > endTime.ts) endTime = endTime.plus({ days: 1 });
    
                            let info = entry.Titolo_trasmissione.replaceAll("\r", "").replaceAll("\n", "").replaceAll("\t", "").split(/[ ]{2,}/g);
                            let name = info[0].split(" ").map(el => el.slice(0, 1) + el.slice(1).toLowerCase()).join(" ").replaceAll("''", "'");

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
                            if (info[1] && info[1].trim()) {
                                if (info[1].trim().slice(0, 1) === info[1].trim().slice(0, 1).toLowerCase()) {
                                    result.description = info[1].trim().slice(0, 1).toUpperCase() + info[1].trim().slice(1).replaceAll("''", "'");
                                } else result.description = info[1].trim().replaceAll("''", "'");
                            };
    
                            return result;
                        } else return [];
                    })];
                    log("generating-done", { source: "ètv", channel: channels[channel], day: "N/A" });
                    await fs.writeFile(
                        path.join(__dirname, "../.epg-cache.json"),
                        JSON.stringify(merge({}, existingCache, {
                            ètv: epg
                        }), null, 4)
                    );
                })
                .catch(err => log("generating-fail", { source: "ètv", channel: channels[channel], day: "N/A", error: err }));
        };
    };
    log("spacer", { width: 67 });

    return epg;
};