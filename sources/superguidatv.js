import { DateTime } from "luxon";
import log from "../utils/logger";

export default async function fetchEPG(channels) {
    const randomString = (length, hex) => {
        let result = "";
        let characters = hex ? "abcdef1234567890" : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    };
    const accessToken = await fetch("https://api-ng.superguidatv.it/v3/oauth/guest", {
        method: "POST",
        headers: {
            "x-client-token": `${Math.floor(DateTime.now().toSeconds())}-${randomString(43)}=`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "client_id": randomString(22),
            "device_id": `AID_${randomString(16, true)}`
        })
    })
        .then(response => response.json())
        .then(json => json.access_token);

    let epg = {};

    for (const channel in channels) {
        epg[channels[channel]] = [];
        let lastEntryEndDate;
        for (const daysToAdd in [...Array(7).keys()]) {
            const startDate = DateTime.now().setZone("Europe/Rome").plus({ days: parseInt(daysToAdd) }).toFormat("yyyy-MM-dd");
            const endDate = DateTime.now().setZone("Europe/Rome").plus({ days: parseInt(daysToAdd) + 1 }).toFormat("yyyy-MM-dd");

            log("generating", { source: "superguidatv", channel: channels[channel], day: `${startDate} - ${endDate}` });
            await fetch(`https://api-ng.superguidatv.it/v3/channels-events?startDate=${startDate}T00:00:00&endDate=${endDate}T23:59:59&orderBy=channelNumber&channelId[]=${channels[channel]}&ct-ver=1is&bld=5504148&plt=ANDROID`, {
                headers: {
                    "x-client-token": `${Math.floor(DateTime.now().toSeconds())}-${randomString(43)}=`,
                    "Authorization": `Bearer ${accessToken}`
                }
            })
                .then(response => response.json())
                .then(json => {
                    epg[channels[channel]] = [...epg[channels[channel]], ...json[0].events.flatMap((entry, index) => {
                        const startTime = DateTime.fromISO(entry.event.startDate);
                        const endTime = DateTime.fromISO(entry.event.endDate);
                        if ((lastEntryEndDate && startTime.ts > lastEntryEndDate) || lastEntryEndDate != endTime.ts) {
                            const today = DateTime.now().setZone("Europe/Rome").startOf("day");
    
                            if (today.ts <= endTime.ts) {
                                let name;
                                if (entry.event.title === entry.event.title.toLowerCase()) {
                                    name = entry.event.title.split(" ").map(el => el.slice(0, 1).toUpperCase() + el.slice(1)).join(" ");
                                } else name = entry.event.title;

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
                                if (entry.event.story && entry.event.story.trim()) {
                                    if (entry.event.story.trim().slice(0, 1) === entry.event.story.trim().slice(0, 1).toLowerCase()) {
                                        result.description = entry.event.story.trim().slice(0, 1).toUpperCase() + entry.event.story.trim().slice(1);
                                    } else result.description = entry.event.story.trim();
                                };
                                if (entry.serie) {
                                    if (entry.serie.backdropUrl || entry.serie.coverUrl) {
                                        result.image = entry.serie.backdropUrl ? entry.serie.backdropUrl : entry.serie.coverUrl;
                                    };
                                } else if (entry.program) {
                                    if (entry.program.backdropUrl || entry.program.coverUrl) {
                                        result.image = entry.program.backdropUrl ? entry.program.backdropUrl : entry.program.coverUrl;
                                    };
                                };

                                if (lastEntryEndDate && index != 0 && DateTime.fromISO(entry.event.startDate).ts != lastEntryEndDate) {
                                    result = [
                                        {
                                            name: "Programmazione non disponibile",
                                            startTime: {
                                                unix: DateTime.fromMillis(lastEntryEndDate).ts,
                                                iso: DateTime.fromMillis(lastEntryEndDate).toISO()
                                            },
                                            endTime: {
                                                unix: DateTime.fromISO(entry.event.startDate).ts,
                                                iso: DateTime.fromISO(entry.event.startDate).toISO()
                                            }
                                        },
                                        result
                                    ]
                                };
                                lastEntryEndDate = DateTime.fromISO(entry.event.endDate).ts;

                                return result;
                            } else return [];
                        } else return [];
                    })];
                    log("generating-done", { source: "superguidatv", channel: channels[channel], day: `${startDate} - ${endDate}` });
                })
                .catch(err => log("generating-fail", { source: "superguidatv", channel: channels[channel], day: `${startDate} - ${endDate}`, error: err }));

            };
        const seenStarts = new Set();
        const seenEnds = new Set();

        epg[channels[channel]] = epg[channels[channel]].filter(ev => {
            const start = ev.startTime.unix;
            const end = ev.endTime.unix;

            if (seenStarts.has(start) || seenEnds.has(end)) return false;

            seenStarts.add(start);
            seenEnds.add(end);
            return true;
        });

        log("spacer", { width: 89 });
    };

    return epg;
};