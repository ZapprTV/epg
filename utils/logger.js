const locales = {
    it: {
        source: "Sorgente",
        channel: "Canale",
        date: "Data",
        done: "Fatto!",
        error: "Errore",
        writingJSON: "Scrittura JSON"
    },
    en: {
        source: "Source",
        channel: "Channel",
        date: "Date",
        done: "Done!",
        error: "Error",
        writingJSON: "Writing JSON"
    }
};

export default async function log(type, options) {
    let locale;
    if (options && options.language && options.language in locales) locale = locales[options.language]
    else locale = locales["it"];

    const colors = {
        gray: "\x1b[90m",
        white: "\x1b[97m",
        green: "\x1b[32m",
        reset: "\x1b[0m",
        red: "\x1b[31m",
    };
    if (type === "generating") process.stdout.write(
        `${colors.gray}${locale["source"]}: ${colors.white}${options.source} ${colors.gray}| ` +
        `${colors.gray}${locale["channel"]}: ${colors.white}${options.channel.toString().padEnd(4, " ")} ${colors.gray}| ` +
        `${colors.gray}${locale["date"]}: ${colors.white}${options.day} ${colors.gray}>${colors.reset}` + "\n"
    )
    else if (type === "generating-done") process.stdout.write(
        `\x1b[1A\r` +
        `${colors.gray}${locale["source"]}: ${colors.white}${options.source} ${colors.gray}| ` +
        `${colors.gray}${locale["channel"]}: ${colors.white}${options.channel.toString().padEnd(4, " ")} ${colors.gray}| ` +
        `${colors.gray}${locale["date"]}: ${colors.white}${options.day} ${colors.gray}>${colors.reset}` +
        ` ${colors.green}✅  ${locale["done"]}${colors.reset}` + "\n"
    )
    else if (type === "generating-fail") process.stdout.write(
        `\x1b[1A\r` +
        `${colors.gray}${locale["source"]}: ${colors.white}${options.source} ${colors.gray}| ` +
        `${colors.gray}${locale["channel"]}: ${colors.white}${options.channel.toString().padEnd(4, " ")} ${colors.gray}| ` +
        `${colors.gray}${locale["date"]}: ${colors.white}${options.day} ${colors.gray}>${colors.reset}` +
        ` ${colors.red}❌  ${locale["error"]}: ${options.error}${colors.reset}` + "\n"
    )
    else if (type === "writing") process.stdout.write(
        `${colors.gray}${locale["writingJSON"]}${options && options.region ? ` (${options.region})` : ""} > ` + "\n"
    )
    else if (type === "writing-done") process.stdout.write(
        `\x1b[1A\r` +
        `${colors.gray}${locale["writingJSON"]}${options && options.region ? ` (${options.region})` : ""} > ${colors.green}✅  ${locale["done"]}${colors.reset}` + "\n"
    )
    else if (type === "spacer") console.log(colors.gray + "─".repeat(options && options.width ? options.width : process.stdout.columns) + colors.reset);

};