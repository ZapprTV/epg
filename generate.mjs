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