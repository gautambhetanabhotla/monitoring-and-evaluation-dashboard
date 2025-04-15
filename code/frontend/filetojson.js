import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exiftool } from 'exiftool-vendored';
import process from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const updateDocumentJson = async (filePath) => {
    const documentsPath = path.join(__dirname, 'public', 'documents.json');

    // Read the binary data of the file
    const binaryData = fs.readFileSync(filePath);

    // Extract metadata using exiftool
    let metadata = {};
    try {
        metadata = await exiftool.read(filePath);
    } catch (error) {
        console.error('Failed to extract metadata using exiftool:', error.message);
    }

    // Read the existing documents.json
    const documents = JSON.parse(fs.readFileSync(documentsPath, 'utf-8'));

    // Update the first object in the array
    const doc = {
        project: "67cadfd3ae068409d0b8fd96"
    };
    doc.metadata = metadata;
    doc.data = binaryData.toString('base64'); // Store binary data as Base64
    documents.push(doc);

    fs.writeFileSync(documentsPath, JSON.stringify(documents, null, 4));
    console.log('Updated documents.json with new file data.');
};

const filePath = process.argv[2];
if (!filePath) {
    console.error('Please provide a file path as an argument.');
    process.exit(1);
}

updateDocumentJson(filePath).then(() => {
    console.log('Metadata extraction complete.');
}).catch((error) => {
    console.error('An error occurred:', error.message);
});