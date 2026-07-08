import fs from "fs";
import * as cheerio from "cheerio";

const html = fs.readFileSync("courses.html", "utf8");

const $ = cheerio.load(html);

const courses = {};

$("option").each((_, el) => {
    const id = $(el).attr("value");
    const name = $(el).text().trim();

    if (!id || name.includes("Select Course")) return;

    courses[name.toLowerCase()] = id;
});

fs.writeFileSync(
    "colleges.json",
    JSON.stringify(courses, null, 2)
);

console.log("courses.json created");