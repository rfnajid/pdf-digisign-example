// import
require('dotenv').config()

const fs = require("fs");
const PDFExtract = require("pdf.js-extract").PDFExtract;
const pdfExtract = new PDFExtract();
const HummusRecipe = require('hummus-recipe');

// dotenv config
const keywordHolder = process.env.KEYWORD_HOLDER;
const keywordInsured = process.env.KEYWORD_INSURED;
const keywordParent = process.env.KEYWORD_PARENT;
const pdfPath = process.env.PDF_PATH;
const signPath = process.env.SIGN_PATH;
const pdfResultPath = process.env.PDF_RESULT_PATH;

const pdfExtractOptions = {
    password: 'password'
}

pdfExtract.extract(pdfPath, pdfExtractOptions , function (err, data) {
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
                element.page = pageNum + 1;
                if(!coordinates[element.page]){
                    coordinates[element.page]=[];
                }
                coordinates[element.page].push(element);
            }
        });
    });
	console.log(JSON.stringify(coordinates, null, "\t"));

    embedSign(coordinates);
});

async function embedSign(coordinates){
    console.log('embedSign');

    const pages = Object.keys(coordinates);
    let pdfDoc = new HummusRecipe(pdfPath, pdfResultPath);
    // loop per pages
    pages.forEach(page => {
        console.log('page' + page);
        pdfDoc
            .editPage(page);

        // loop per coordinate
        coordinates[page].forEach(coordinate => {
            console.log('coordinate ' + JSON.stringify(coordinate));
            pdfDoc
                .image(signPath, coordinate.x, coordinate.y, {width: 100, keepAspectRatio: true});
        });

        pdfDoc.endPage();
    });

    pdfDoc.endPDF();
}