import { DateTime } from "luxon";
import log from "../utils/logger";
import { parseHTML } from "linkedom";

export default async function fetchEPG(channels) {
    let epg = {};

    for (const channel in channels) {
        epg[channels[channel]] = [];
        for (const daysToAdd in [...Array(8).keys()]) {
            const day = DateTime.now().plus({ days: daysToAdd }).toUTC().startOf("day");
            const date = day.toSeconds();
            log("generating", { source: "publirose", channel: channels[channel], day: date });
            await fetch(`https://www.publirose.it/wp2/wp-admin/admin-ajax.php`, {
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
                .then(json => {
                    const { document } = parseHTML(json.html.replaceAll("\t", "").replaceAll("\n", "").replaceAll("\r", ""));
                    epg[channels[channel]] = [...epg[channels[channel]], ...Array.from(document.querySelectorAll("tbody tr")).flatMap(entry => {
                        const startTime = day.setZone("Europe/Rome").set({
                            hour: entry.querySelector(".extvs-table1-time").innerText.split(":")[0],
                            minutes: entry.querySelector(".extvs-table1-time").innerText.split(":")[1]
                        });
                        const endTime = entry.nextElementSibling ? day.setZone("Europe/Rome").set({
                            hour: entry.nextElementSibling.querySelector(".extvs-table1-time").innerText.split(":")[0],
                            minutes: entry.nextElementSibling.querySelector(".extvs-table1-time").innerText.split(":")[1]
                        }) : day.plus({ days: 1 }).setZone("Europe/Rome");
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
                        if (entry.querySelector("img")) {
                            result.image = entry.querySelector("img").src.split("-").slice(0, -1).join("-") + "." + entry.querySelector("img").src.split("-").slice(-1)[0].split(".").slice(-1)[0];
                        };

                        return result;
                    })];
                    log("generating-done", { source: "publirose", channel: channels[channel], day: date });
                })
                .catch(err => log("generating-fail", { source: "publirose", channel: channels[channel], day: date, error: err }));
        };
        log("spacer", { width: 74 });
    };

    return epg;
};