import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mime from 'mime-types';
import exifParser from 'exif-parser';
import process from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const updateDocumentJson = (filePath) => {
    const documentsPath = path.join(__dirname, 'public', 'documents.json');

    // Read the file metadata
    const mimeType = mime.lookup(filePath) || 'application/octet-stream';
    const fileName = path.basename(filePath);

    // Read the binary data of the file
    const binaryData = fs.readFileSync(filePath);

    // Parse EXIF metadata
    let exifData = {};
    try {
        const parser = exifParser.create(binaryData);
        exifData = parser.parse().tags;
    } catch (error) {
        console.error('Failed to parse EXIF metadata:', error.message);
    }

    // Read the existing documents.json
    const documents = JSON.parse(fs.readFileSync(documentsPath, 'utf-8'));

    // Update the first object in the array
    const doc = {
        project: "67cadfd3ae068409d0b8fd96"
    };
    doc.metadata = {
        'MIME Type': mimeType,
        'File Name': fileName,
        ...exifData,
    };
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

updateDocumentJson(filePath);