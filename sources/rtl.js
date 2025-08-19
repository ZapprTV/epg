import { DateTime } from "luxon";
import log from "../utils/logger";
import { parseHTML } from "linkedom";

export default async function fetchEPG(channels) {
    let epg = {};

    for (const channel in channels) {
        epg[channels[channel]] = [];
        await fetch(`https://api-core.rtl.it/v1/${channels[channel]}/schedule`)
            .then(response => response.json())
            .then(json => {
                log("generating", { source: "rtl", channel: channels[channel], day: "N/A" });
                epg[channels[channel]] = [...epg[channels[channel]], ...json.data.flatMap(day => {
                    if (DateTime.fromFormat(day.date.split("T")[0], "yyyy-MM-dd").ts - DateTime.now().startOf("day").ts >= 0) {
                        const date = DateTime.fromISO(day.date).setZone("Europe/Rome").minus({ hours: 2 });
                        return day.schedule.map(entry => {
                            const startHours = DateTime.fromISO(entry.start).setZone("Europe/Rome").minus({ hours: 1 });
                            const endHours = DateTime.fromISO(entry.end).setZone("Europe/Rome").minus({ hours: 1 });
                            const startTime = date.set({ hour: startHours.hour, minutes: startHours.minute, seconds: startHours.second });
                            const endTime = date.set({ hour: endHours.hour, minutes: endHours.minute, seconds: endHours.second });
                            let result = {
                                name: entry.show.name,
                                startTime: {
                                    unix: startTime.ts,
                                    iso: startTime.toISO()
                                },
                                endTime: {
                                    unix: endTime.ts,
                                    iso: endTime.toISO()
                                }
                            };
                            if (entry.show.image && entry.show.image["1000"] && entry.show.image["1000"].trim()) result.image = entry.show.image["1000"].trim();
                            if (entry.show.descriptiption && entry.show.descriptiption.trim()) {
                                const { document } = parseHTML(`<body id="description">${entry.show.descriptiption}</body>`);
                                result.description = document.querySelector("#description").innerText.trim();
                            };
                            if (entry.show.schedule && entry.show.schedule.trim()) result.subtitle = entry.show.schedule.trim();
                            return result;
                        });
                    } else return [];
                })];
                log("generating-done", { source: "rtl", channel: channels[channel], day: "N/A" });
            })
            .catch(err => log("generating-fail", { source: "rtl", channel: channels[channel], day: "N/A", error: err }));
    };

    log("spacer", { width: 62 });

    return epg;
};