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

    const nonce = await fetch(`https://www.tv33.it/guida-tv`)
        .then(response => response.text())
        .then(html => {
            const { document } = parseHTML(html);
            return document.querySelector("[data-nonce]").dataset.nonce;
        });

    for (const channel in channels) {
        let existingCache = {};
        try {
            const data = await fs.readFile(path.join(__dirname, "../../.epg-cache.json"), "utf-8");
            existingCache = JSON.parse(data);
        } catch { };
        
        if (existingCache && existingCache["tv33"] && existingCache["tv33"][channels[channel]]) {
            log("generating", { source: "tv33", channel: channels[channel], day: "N/A - Cachato" });
            epg[channels[channel]] = existingCache["tv33"][channels[channel]];
            log("generating-done", { source: "tv33", channel: channels[channel], day: "N/A - Cachato" });
        } else {
            epg[channels[channel]] = [];
            for (const daysToAdd in [...Array(7).keys()]) {
                const day = DateTime.now().plus({ days: daysToAdd }).startOf("day");
                const date = day.toFormat("yyyy-MM-dd");
                log("generating", { source: "tv33", channel: channels[channel], day: date });
                await fetch(`https://www.tv33.it/wp-admin/admin-ajax.php`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: new URLSearchParams({
                        date: date,
                        action: "mic_get_daily_guide_ajax",
                        nonce: nonce
                    })
                })
                    .then(response => response.json())
                    .then(async json => {
                        const { document } = parseHTML(json.data.html.replaceAll("\t", "").replaceAll("\n", "").replaceAll("\r", ""));
                        if (channels[channel] === "trentino") document.querySelectorAll(".btn-alto-adige").forEach(el => el.closest(".item").remove());
                        else document.querySelectorAll(".btn-trentino").forEach(el => el.closest(".item").remove());
                        epg[channels[channel]] = [...epg[channels[channel]], ...Array.from(document.querySelectorAll(".item")).flatMap(entry => {
                            const startTime = day.setZone("Europe/Rome").set({
                                hour: entry.dataset.time.split(":")[0],
                                minutes: entry.dataset.time.split(":")[1]
                            });
                            const endTime = entry.nextElementSibling ? day.setZone("Europe/Rome").set({
                                hour: entry.nextElementSibling.dataset.time.split(":")[0],
                                minutes: entry.nextElementSibling.dataset.time.split(":")[1]
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
                            if (entry.querySelector(".episode-title-container") && entry.querySelector(".episode-title-container").innerText.trim()) {
                                result.subtitle = entry.querySelector(".episode-title-container").innerText.trim();
                                entry.querySelector(".episode-title-container").remove();
                            };
                            if (entry.querySelector(".text") && entry.querySelector(".text").innerText.trim()) result.description = entry.querySelector(".text").innerText.trim();
                            if (entry.querySelector("img")) result.image = entry.querySelector("img").src;

                            return result;
                        })];
                        log("generating-done", { source: "tv33", channel: channels[channel], day: date });
                        await fs.writeFile(
                            path.join(__dirname, "../../.epg-cache.json"),
                            JSON.stringify(merge({}, existingCache, {
                                tv33: epg
                            }), null, 4)
                        );
                    })
                    .catch(err => log("generating-fail", { source: "tv33", channel: channels[channel], day: date, error: err }));
            };
        };
        log("spacer", { width: 68 });
    };

    return epg;
};