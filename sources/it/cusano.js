import { DateTime } from "luxon";
import log from "../../utils/logger";
import { parseHTML } from "linkedom";

export default async function fetchEPG(channels) {
    let epg = {};

    for (const channel in channels) {
        log("generating", { source: "cusano", channel: channels[channel], day: `N/A - 7 giorni` });
        await fetch(`https://www.cusanomediaplay.it/palinsesto/${channels[channel]}`)
            .then(response => response.text())
            .then(html => {
                const { document } = parseHTML(html);
                epg[channels[channel]] = Array.from(document.querySelectorAll("#palinsesto .riga")).map(entry => {
                    const daysToAdd = entry.parentElement.id.split("_")[1];
                    const day = DateTime.now().setZone("Europe/Rome").plus({ days: daysToAdd }).startOf("day");
                    const startTime = day.set({
                        hour: entry.querySelector(".hh").innerText.split(":")[0],
                        minutes: entry.querySelector(".hh").innerText.split(":")[1]
                    });
                    const endTime = entry.nextElementSibling ? day.set({
                        hour: entry.nextElementSibling.querySelector(".hh").innerText.split(":")[0],
                        minutes: entry.nextElementSibling.querySelector(".hh").innerText.split(":")[1]
                    }) : day.plus({ days: 1 });
                    
                    let result = {
                        name: entry.querySelector(".txt").innerText.trim(),
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
                });
                log("generating-done", { source: "cusano", channel: channels[channel], day: `N/A - 7 giorni` });
            })
            .catch(err => log("generating-fail", { source: "cusano", channel: channels[channel], day: `N/A - 7 giorni`, error: err }));
    };
    log("spacer", { width: 81 });

    return epg;
};