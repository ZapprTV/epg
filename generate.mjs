import nationalSources from "./lists/it/dtt/national";
import log from "./utils/logger";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const nationalEPG = {};
const __dirname = path.dirname(fileURLToPath(import.meta.url));

for (const source of Object.keys(nationalSources)) {
    try {
        const { fetch, channels } = nationalSources[source];
        nationalEPG[source] = await fetch(channels);
    } catch (e) {
        console.error(`Impossibile fetchare l'EPG da ${source}: ${e.message}`);
        nationalEPG[source] = [];
    };
};

log("writing");
await fs.writeFile(path.join(__dirname, "output/it/dtt/national.json"), JSON.stringify(nationalEPG, null, 4));
log("writing-done");
console.log("");
log("spacer");
console.log("");

const regionalSources = (await fs.readdir(path.join(__dirname, "lists/it/dtt/regional"))).filter(file => file.endsWith(".js"));

for (const source of regionalSources) {
    const region = path.basename(source, ".js");
    const regionSources = await import(path.join(__dirname, "lists/it/dtt/regional", source));
    const regionEPG = {};
    for (const source of Object.keys(regionSources.default)) {
        try {
            const { fetch, channels } = regionSources.default[source];
            regionEPG[source] = await fetch(channels);
        } catch (e) {
            console.error(`Impossibile fetchare l'EPG da ${source} (per ${region}): ${e.message}`);
            regionEPG[source] = [];
        };
    };
    log("writing", { region: region });
    await fs.writeFile(path.join(__dirname, `output/it/dtt/regional/${region}.json`), JSON.stringify(regionEPG, null, 4));
    log("writing-done", { region: region });
    console.log("");
    log("spacer");
    console.log("");
};

try {
    await fs.rm(path.join(__dirname, ".epg-cache.json"));
} catch { };