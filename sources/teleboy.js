import { DateTime } from "luxon";
import log from "../utils/logger";

export default async function fetchEPG(channels) {
    let epg = {};
    let lastEntryID;

    for (const channel in channels) {
        epg[channels[channel]] = [];
        for (const daysToAdd in [...Array(7).keys()]) {
            const startDate = DateTime.now().setZone("Europe/Rome").plus({ days: parseInt(daysToAdd) }).startOf("day").toFormat("yyyy-MM-dd HH:mm:ss");
            const endDate = DateTime.now().setZone("Europe/Rome").plus({ days: parseInt(daysToAdd) + 1 }).startOf("day").toFormat("yyyy-MM-dd HH:mm:ss");

            log("generating", { source: "teleboy", channel: channels[channel], day: `${startDate} - ${endDate}` });
            await fetch(`https://api.teleboy.ch/epg/broadcasts?begin=${startDate}&end=${endDate}&expand=flags,primary_image&station=${channels[channel]}`, {
                headers: {
                    "x-teleboy-apikey": "e899f715940a209148f834702fc7f340b6b0496b62120b3ed9c9b3ec4d7dca00"
                }
            })
                .then(response => response.json())
                .then(json => {
                    epg[channels[channel]] = [...epg[channels[channel]], ...json.data.items.flatMap(entry => {
                        const startTime = DateTime.fromISO(entry.begin);
                        const endTime = DateTime.fromISO(entry.end);
                        const today = DateTime.now().setZone("Europe/Rome").startOf("day");
                        if (today.ts <= endTime.ts && entry.id != lastEntryID) {
                            lastEntryID = entry.id;
                            let result = {
                                name: entry.title,
                                startTime: {
                                    unix: startTime.ts,
                                    iso: startTime.toISO()
                                },
                                endTime: {
                                    unix: endTime.ts,
                                    iso: endTime.toISO()
                                }
                            };
                            if (entry.primary_image && entry.primary_image.hash != "646b43e914f31a437959f5b1050a6aa37ab28d24") result.image = `${entry.primary_image.base_path}teleboyteaser12/${entry.primary_image.hash}.jpg`;
    
                            return result;
                        } else return [];
                    })];
                    log("generating-done", { source: "teleboy", channel: channels[channel], day: `${startDate} - ${endDate}` });
                })
                .catch(err => log("generating-fail", { source: "teleboy", channel: channels[channel], day: `${startDate} - ${endDate}`, error: err }));
        };
        log("spacer", { width: 96 });
    };

    return epg;
};