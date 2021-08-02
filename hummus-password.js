// import
require('dotenv').config()

const HummusRecipe = require('hummus-recipe');

// dotenv config
const pdfPath = process.env.PDF_PATH;
const pdfResultPath = process.env.PDF_RESULT_PATH;

const pdfDoc = new HummusRecipe(pdfPath, pdfResultPath);

pdfDoc
    .encrypt({
        userPassword: 'password',
        ownerPassword: 'password',
        userProtectionFlag: 4
    })
    .endPDF();