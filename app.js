import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import courses from "./courses.json" with { type: "json" };

const allStudents = [];

for (const [courseName, courseId] of Object.entries(courses)) {

    console.log(`\nProcessing Course: ${courseName}`);

    try {

        const colleges = await getColleges(courseId);

        console.log(`Found ${colleges.length} colleges`);

        for (const college of colleges) {

            try {

                console.log(
                    `   Fetching ${college.name}`
                );

                const students =
                    await getAllotments(
                        college.id,
                        courseId
                    );

                for (const student of students) {

                    allStudents.push({
                        courseId,
                        courseName,

                        collegeId: college.id,
                        collegeName: college.name,

                        ...student
                    });

                }

                console.log(
                    `      ${students.length} students`
                );

            } catch (err) {

                console.log(
                    `      Failed: ${college.name}`
                );

            }
        }

    } catch (err) {

        console.log(
            `Failed course: ${courseName}`
        );

    }
}

fs.writeFileSync(
    "allotments.json",
    JSON.stringify(
        allStudents,
        null,
        2
    )
);

console.log(
    `\nSaved ${allStudents.length} allotments to allotments.json`
);


async function getColleges(courseId) {

    const body = new URLSearchParams({
        CourseID: courseId
    });

    const response = await axios.post(
        "https://lbsapplications.kerala.gov.in/btechlet2026/home/get_colleges",
        body.toString(),
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }
    );

    const html = `<select>${response.data.MyOptions}</select>`;
    const $ = cheerio.load(html);

    const colleges = [];

    $("option").each((i, el) => {

        const id = $(el).attr("value");
        const name = $(el).text().trim();

        if (!id || id === "0") return;

        colleges.push({
            id,
            name
        });
    });

    return colleges;
}



async function getAllotments(collegeId, courseId) {
    const body = new URLSearchParams({
        CID: collegeId,
        CourseID: courseId,
        Search: "Search"
    });

    const response = await axios.post(
        "https://lbsapplications.kerala.gov.in/btechlet2026/home/allotment",
        body.toString(),
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }
    );
    
    const $ = cheerio.load(response.data);

    const table = $(".allotment-table-container table");

    if (!table.length) {
        return [];
    }

    const headers = [];

    table.find("thead th").each((i, el) => {
        headers.push($(el).text().trim());
    });

    const allotments = [];

    table.find("tbody tr").each((i, row) => {

        const student = {};

        $(row)
            .find("td")
            .each((j, col) => {

                const key = headers[j] || `column_${j}`;

                student[key] = $(col)
                    .text()
                    .trim();

            });

        if (Object.keys(student).length) {
            allotments.push(student);
        }

    });
    
   
    return allotments;
}