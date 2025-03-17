import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import * as XLSX from 'xlsx';

const FileUploader = ({ onDataLoaded }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const processCSV = (file) => {
    setIsProcessing(true);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const csvText = event.target.result;
        if (!csvText.trim()) throw new Error('The CSV file is empty.');
        
        const lines = csvText.split(/\r\n|\n/);
        if (lines.length < 2) throw new Error('No data rows found in the CSV file.');
        
        const dataLines = lines.slice(1).filter(line => line.trim() !== '');
        const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, ''));
        const jsonData = dataLines.map(line => {
          const values = line.split(',').map(v => v.replace(/^"|"$/g, ''));
          return Object.fromEntries(headers.map((header, i) => [header, values[i] || '']));
        });
        
        onDataLoaded(jsonData, headers);
      } catch (error) {
        console.error('Error parsing CSV:', error);
      } finally {
        setIsProcessing(false);
      }
    };
    
    reader.onerror = () => setIsProcessing(false);
    reader.readAsText(file, 'UTF-8');
  };

  const processExcel = (file) => {
    setIsProcessing(true);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        
        if (jsonData.length === 0) throw new Error('The Excel file contains no data.');
        onDataLoaded(jsonData, Object.keys(jsonData[0]));
      } catch (error) {
        console.error('Error processing Excel file:', error);
      } finally {
        setIsProcessing(false);
      }
    };
    
    reader.onerror = () => setIsProcessing(false);
    reader.readAsArrayBuffer(file);
  };

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;
      
      const file = acceptedFiles[0];
      const fileExtension = file.name.split('.').pop().toLowerCase();
      
      if (fileExtension === 'csv') {
        processCSV(file);
      } else if (['xlsx', 'xls' , 'ods'].includes(fileExtension)) {
        processExcel(file);
      }
    },
    [onDataLoaded]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.oasis.opendocument.spreadsheet': ['.ods'],
    },
    multiple: false,
    disabled: isProcessing,
  });

  return (
    <div {...getRootProps()} className={`dropzone ${isDragActive ? 'dropzone-active' : ''} ${isProcessing ? 'dropzone-processing' : ''}`}>
      <input {...getInputProps()} />
      <Upload className={isProcessing ? 'upload-icon processing' : 'upload-icon'} />
      <p className="upload-text">
        {isDragActive ? 'Drop the file here' : isProcessing ? 'Processing file...' : 'Drag & drop a file here, or click to select'}
      </p>
      <p className="upload-subtext">Supports CSV & Excel(Sheet) files (.csv, .xls, .xlsx , .ods)</p>
      {isProcessing && <div className="processing-indicator"><div className="processing-bar"></div></div>}
    </div>
  );
};

export default FileUploader;