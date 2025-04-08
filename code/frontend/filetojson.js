import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mime from 'mime-types';
import exifParser from 'exif-parser';

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
    if (documents.length > 1) {
        documents[1].metadata = {
            ...documents[1].metadata,
            'MIME Type': mimeType,
            'File Name': fileName,
            ...exifData,
        };
        documents[1].data = binaryData.toString('base64'); // Store binary data as Base64
    }

    // Write the updated JSON back to the file
    fs.writeFileSync(documentsPath, JSON.stringify(documents, null, 4));
};

updateDocumentJson('/home/gautam/Downloads/Assignment 3.pdf');