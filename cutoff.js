import fs from "fs";


const allotments = JSON.parse(
    fs.readFileSync("allotments.json")
);

const cutoffs = {};

for (const s of allotments) {

    const key = [
        s.collegeId,
        s.courseId,
        s["Alloted Category"]
    ].join("_");

    const rank = Number(s.Rank);

    if (
        !cutoffs[key] ||
        rank > cutoffs[key].closingRank
    ) {
        cutoffs[key] = {
            collegeId: s.collegeId,
            collegeName: s.collegeName,
            courseId: s.courseId,
            courseName: s.courseName,
            category: s["Alloted Category"],
            closingRank: rank
        };
    }
}

fs.writeFileSync(
    "cutoffs.json",
    JSON.stringify(
        Object.values(cutoffs),
        null,
        2
    )
);