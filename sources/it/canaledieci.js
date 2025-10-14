import { DateTime } from "luxon";
import log from "../../utils/logger";
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
            const data = await fs.readFile(path.join(__dirname, "../../.epg-cache.json"), "utf-8");
            existingCache = JSON.parse(data);
        } catch { };
        
        if (existingCache && existingCache["canaledieci"] && existingCache["canaledieci"][channels[channel]]) {
            log("generating", { source: "canaledieci", channel: channels[channel], day: "N/A - Cachato" });
            epg[channels[channel]] = existingCache["canaledieci"][channels[channel]];
            log("generating-done", { source: "canaledieci", channel: channels[channel], day: "N/A - Cachato" });
        } else {
            epg[channels[channel]] = [];
            for (const daysToAdd in [...Array(8).keys()]) {
                const day = DateTime.now().plus({ days: daysToAdd }).toUTC().startOf("day");
                const date = day.toSeconds();
                log("generating", { source: "canaledieci", channel: channels[channel], day: date });
                await fetch(`https://canaledieci.tv/wp-admin/admin-ajax.php`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: new URLSearchParams({
                        date: date,
                        action: "extvs_get_schedule_simple",
                        param_shortcode: JSON.stringify({"style": "2", "fullcontent_in": "collapse", "show_image": "show", "channel": "", "slidesshow": "", "slidesscroll": "", "start_on": "", "before_today": "2", "after_today": "9", "order": "DESC", "orderby": "date", "meta_key": "", "meta_value": "", "order_channel": "yes", "class": "", "ID": "ex-4559"}),
                        chanel: channels[channel]
                    })
                })
                    .then(response => response.json())
                    .then(async json => {
                        const { document } = parseHTML(json.html.replaceAll("\t", "").replaceAll("\n", "").replaceAll("\r", ""));
                        epg[channels[channel]] = [...epg[channels[channel]], {
                            name: "Programmazione notturna",
                            startTime: {
                                unix: day.setZone("Europe/Rome").minus({ hours: 2 }).toMillis(),
                                iso: day.setZone("Europe/Rome").minus({ hours: 2 }).toISO()
                            },
                            endTime: {
                                unix: day.set({ hour: 6 }).setZone("Europe/Rome").minus({ hours: 2 }).toMillis(),
                                iso: day.set({ hour: 6 }).setZone("Europe/Rome").minus({ hours: 2 }).toISO()
                            }
                        }, ...Array.from(document.querySelectorAll("tbody tr")).flatMap(entry => {
                            const startTime = day.setZone("Europe/Rome").set({
                                hour: entry.querySelector(".extvs-table1-time").innerText.split(":")[0],
                                minutes: entry.querySelector(".extvs-table1-time").innerText.split(":")[1]
                            });
                            const endTime = entry.nextElementSibling ? day.setZone("Europe/Rome").set({
                                hour: entry.nextElementSibling.querySelector(".extvs-table1-time").innerText.split(":")[0],
                                minutes: entry.nextElementSibling.querySelector(".extvs-table1-time").innerText.split(":")[1]
                            }) : day.plus({ days: 1 }).setZone("Europe/Rome").minus({ hours: 2 });
                            let result = {
                                name: entry.querySelector("h3").innerText.trim(),
                                startTime: {
                                    unix: startTime.ts,
                                    iso: startTime.toISO()
                                },
                                endTime: {
                                    unix: endTime.ts,
                                    iso: endTime.toISO()
                                }
                            };
                            if (entry.querySelector(".extvs-collap-ct") && entry.querySelector(".extvs-collap-ct").innerText.trim()) result.description = entry.querySelector(".extvs-collap-ct").innerText.trim();
    
                            return result;
                        })];
                        log("generating-done", { source: "canaledieci", channel: channels[channel], day: date });
                        await fs.writeFile(
                            path.join(__dirname, "../../.epg-cache.json"),
                            JSON.stringify(merge({}, existingCache, {
                                canaledieci: epg
                            }), null, 4)
                        );
                    })
                    .catch(err => log("generating-fail", { source: "canaledieci", channel: channels[channel], day: date, error: err }));
            };
        };
        log("spacer", { width: 77 });
    };

    return epg;
};