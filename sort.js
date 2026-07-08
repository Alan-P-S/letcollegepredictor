import fs from "fs";
import PDFDocument from "pdfkit";

const data = JSON.parse(
    fs.readFileSync("allotments.json", "utf8")
);

// Sort by rank
data.sort((a, b) => Number(a.Rank) - Number(b.Rank));

const doc = new PDFDocument({
    size: "A4",
    margin: 20
});

doc.pipe(
    fs.createWriteStream("allotments_rankwise.pdf")
);

// Title
doc.fontSize(16)
   .text("LET Allotment Rank List", {
       align: "center"
   });

doc.moveDown();

const drawHeader = () => {
    doc.fontSize(8);

    doc.text("Rank", 20, doc.y, { width: 40 });
    doc.text("Name", 60, doc.y - 10, { width: 140 });
    doc.text("College", 200, doc.y - 10, { width: 180 });
    doc.text("Course", 390, doc.y - 10, { width: 120 });
    doc.text("Cat", 520, doc.y - 10, { width: 40 });

    doc.moveTo(20, doc.y + 2)
       .lineTo(575, doc.y + 2)
       .stroke();

    doc.moveDown(0.5);
};

drawHeader();

for (const s of data) {

    // New page if near bottom
    if (doc.y > 760) {
        doc.addPage();
        drawHeader();
    }

    const y = doc.y;

    doc.fontSize(7);

    doc.text(
        String(s.Rank),
        20,
        y,
        { width: 40 }
    );

    doc.text(
        s.Name || "",
        60,
        y,
        { width: 140 }
    );

    doc.text(
        s.collegeName || "",
        200,
        y,
        { width: 180 }
    );

    doc.text(
        s.courseName || "",
        390,
        y,
        { width: 120 }
    );

    doc.text(
        s["Alloted Category"] || "",
        520,
        y,
        { width: 40 }
    );

    doc.moveDown(1.2);
}

doc.end();

console.log(
    `Generated PDF with ${data.length} students`
);