import fs from "fs";
import { Buffer } from "buffer";

// Replace 'base64String' with your actual base64 string
const base64String = JSON.parse(fs.readFileSync("public/documents.json", 'utf-8'))[0].data;
const buffer = Buffer.from(base64String, "base64");

fs.writeFileSync("document.pdf", buffer);
console.log("PDF file saved as document.pdf");