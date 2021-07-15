// import
require('dotenv').config()

const fs = require("fs");
const PDFExtract = require("pdf.js-extract").PDFExtract;
const pdfExtract = new PDFExtract();
const PDFDocument = require('pdf-lib').PDFDocument;

// dotenv config
const keywordHolder = process.env.KEYWORD_HOLDER;
const keywordInsured = process.env.KEYWORD_INSURED;
const keywordParent = process.env.KEYWORD_PARENT;
const pdfPath = process.env.PDF_PATH;
const signPath = process.env.SIGN_PATH;
const pdfResultPath = process.env.PDF_RESULT_PATH;

pdfExtract.extract(pdfPath, {} /* options*/, function (err, data) {
	if (err) {
		return console.error(err);
	}
	fs.writeFileSync("./example-output.json", JSON.stringify(data, null, "\t"));

    const coordinates = [];

    data.pages.forEach((page, pageNum) => {
        page.content.forEach(element => {
            if(
                element.str === keywordHolder ||
                element.str === keywordInsured ||
                element.str === keywordParent
            ){
                element.page = pageNum;
                coordinates.push(element);
            }
        });
    });
	console.log(JSON.stringify(coordinates, null, "\t"));

    embedSign(coordinates);
});

async function embedSign(coordinates){
    console.log('embedSign');
    
    // Fetch first existing PDF document
    const pdfBytes = fs.readFileSync(pdfPath);

    console.log('read pdf done');

    // Fetch JPEG image
    const signBytes = fs.readFileSync(signPath);

    console.log('read sign done');

    // Create a new PDFDocument
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Embed the JPG image bytes and PNG image bytes
    const signImage = await pdfDoc.embedJpg(signBytes);

    // Get the width/height of the JPG image scaled down to 25% of its original size
    const signScaled = signImage.scale(0.3);

    // Get the pages of the document
    const pages = pdfDoc.getPages();

    console.log('trying to draw signature');

    coordinates.forEach(coordinate => {
        page = pages[coordinate.page];
        pageSize = page.getSize();
        // Draw the signature
        page.drawImage(signImage, {
            x: coordinate.x,
            y: pageSize.height - coordinate.y,
            width: signScaled.width,
            height: signScaled.height
        })
    });

    console.log('save pdf byte');
    // Serialize the PDFDocument to bytes (a Uint8Array)
    const pdfResultBytes = await pdfDoc.save()

    // save result pdf
    fs.writeFileSync(pdfResultPath, pdfResultBytes);
    
}