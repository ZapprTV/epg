import { DateTime } from "luxon";
import log from "../utils/logger";

export default async function fetchEPG(channels) {
    let epg = {};

    for (const channel in channels) {
        epg[channels[channel]] = [];
        for (const daysToAdd in [...Array(7).keys()]) {
            const firstDate = DateTime.now().setZone("Europe/Rome").startOf("day").plus({ days: daysToAdd }).ts;
            const secondDate = DateTime.now().setZone("Europe/Rome").startOf("day").plus({ days: parseInt(daysToAdd) + 1 }).ts;
            log("generating", { source: "mediaset", channel: channels[channel], day: `${firstDate} ~ ${secondDate}` });
            await fetch(`https://api-ott-prod-fe.mediaset.net/PROD/play/feed/allListingFeedEpg/v2.0?byListingTime=${firstDate}~${secondDate}&byCallSign=${channels[channel]}`)
                .then(response => response.json())
                .then(json => {
                    epg[channels[channel]] = [...epg[channels[channel]], ...json.response.entries[0].listings.map(entry => {
                        const startTime = DateTime.fromMillis(entry.startTime).setZone("Europe/Rome");
                        const endTime = DateTime.fromMillis(entry.endTime).setZone("Europe/Rome");

                        let result = {
                            name: entry.mediasetlisting$epgTitle,
                            startTime: {
                                unix: startTime.ts,
                                iso: startTime.toISO()
                            },
                            endTime: {
                                unix: endTime.ts,
                                iso: endTime.toISO()
                            }
                        };
                        if (entry.mediasetlisting$shortDescription && entry.mediasetlisting$shortDescription.trim()) {
                            if (!["EC", "ER", "EW", "BB"].includes(channels[channel])) result.subtitle = entry.mediasetlisting$shortDescription.trim()
                            else {
                                if (/^.* - [0-9]{4}/.test(entry.mediasetlisting$shortDescription)) {
                                    if (entry.mediasetlisting$shortDescription.split(" - ").length <= 2) result.subtitle = entry.mediasetlisting$shortDescription.trim()
                                    else {
                                        result.subtitle = entry.mediasetlisting$shortDescription.split(" - ").slice(0, -1).join(" - ").trim();
                                        result.description = entry.mediasetlisting$shortDescription.split(" - ").slice(2).join(" - ").trim();
                                    };
                                };
                            };
                        };
                        if (entry.description.trim() && !["EC", "ER", "EW", "BB"].includes(channels[channel])) result.description = entry.description.trim();
                        if (entry.program.thumbnails && Object.keys(entry.program.thumbnails).length > 0 && entry.program.thumbnails[Object.keys(entry.program.thumbnails).filter(thumbnail => thumbnail.startsWith("image_horizontal_cover"))[0]]) result.image = entry.program.thumbnails[Object.keys(entry.program.thumbnails).filter(thumbnail => thumbnail.startsWith("image_horizontal_cover"))[0]].url.trim();
                        if (entry.program.mediasetprogram$videoPageUrl || entry.program.mediasetprogram$pageUrl) result.link = `https:${entry.program.mediasetprogram$videoPageUrl || entry.program.mediasetprogram$pageUrl}`;
                        if (entry.mediasetlisting$trafficLight && entry.mediasetlisting$trafficLight != "Green") {
                            const colors = {
                                "Yellow": {
                                    background: "#ffaf00",
                                    label: "Bambini accompagnati",
                                    text: "#000"
                                },
                                "Red": {
                                    background: "#b20707",
                                    label: "Pubblico adulto",
                                    text: "#fff"
                                }
                            }
                            result.rating = colors[entry.mediasetlisting$trafficLight];
                        };

                        return result;
                    })];
                    log("generating-done", { source: "mediaset", channel: channels[channel], day: `${firstDate} ~ ${secondDate}` });
                })
                .catch(err => log("generating-fail", { source: "mediaset", channel: channels[channel], day: `${firstDate} ~ ${secondDate}`, error: err }));
        };
        log("spacer", { width: 83 });
    };

    return epg;
};