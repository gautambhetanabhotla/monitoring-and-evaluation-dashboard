import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';

const FileUploader = ({ onDataLoaded }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const processCSV = (file) => {
    setIsProcessing(true);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const csvText = event.target.result;
        // Check if the content is actually empty, not just the file size
        if (!csvText || csvText.trim() === '') {
          throw new Error('The CSV file appears to be empty or contains no data.');
        }
        
        const lines = csvText.split(/\r\n|\n/);
        
        // Make sure we have data to process
        if (lines.length === 0) {
          throw new Error('No data rows found in the CSV file');
        }
        
        // Extract headers
        const headers = lines[0].split(',').map(header => 
          header.replace(/^"|"$/g, '')  // Remove quotes if they exist
        );
        
        // Process the data rows
        const jsonData = [];
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim() === '') continue;
          
          // Handle quoted values with commas inside them
          const row = {};
          let lineData = lines[i].split(',');
          
          // Simple handling for quoted values
          for (let j = 0; j < headers.length; j++) {
            // Basic cleanup of quotes
            const value = lineData[j] ? lineData[j].replace(/^"|"$/g, '') : '';
            row[headers[j]] = value;
          }
          
          jsonData.push(row);
        }
        
        onDataLoaded(jsonData, headers);
      } catch (error) {
        console.error('Error parsing CSV:', error);
        alert('Error parsing CSV file: ' + (error.message || 'Please check the file format.'));
      } finally {
        setIsProcessing(false);
      }
    };
    
    reader.onerror = (event) => {
      // Log the actual error details for debugging
      console.error('Error reading file:', event.target.error);
      alert('Error reading file. Please try again with a different file.');
      setIsProcessing(false);
    };
    
    // Make sure we're properly handling the file
    try {
      reader.readAsText(file, 'UTF-8');
    } catch (error) {
      console.error('Error initiating file read:', error);
      alert('Error reading file: ' + (error.message || 'Please try again.'));
      setIsProcessing(false);
    }
  };

  const processExcel = (file) => {
    setIsProcessing(true);
    
    try {
      alert("Excel parsing requires a library like SheetJS. Please convert to CSV or implement a library solution.");
      setIsProcessing(false);
    } catch (error) {
      console.error('Error handling Excel file:', error);
      alert('Error handling Excel file: ' + (error.message || 'Excel parsing requires additional libraries.'));
      setIsProcessing(false);
    }
  };

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (!acceptedFiles || acceptedFiles.length === 0) {
        console.log('No files were accepted');
        return;
      }
      
      const file = acceptedFiles[0];
      if (!file) return;

      // Remove the file size check that's causing the false "empty file" message
      // We'll check for actual empty content in the reader.onload handler instead

      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      if (fileExtension === 'csv') {
        processCSV(file);
      } else if (['xlsx', 'xls'].includes(fileExtension || '')) {
        processExcel(file);
      } else {
        alert('Please upload a CSV or Excel file');
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
    },
    multiple: false,
    disabled: isProcessing,
    // Add an additional debug listener to catch dropzone issues
    onDropRejected: (rejectedFiles) => {
      console.log('Files rejected:', rejectedFiles);
      if (rejectedFiles.length > 0) {
        alert(`File rejected: ${rejectedFiles[0].errors.map(e => e.message).join(', ')}`);
      }
    },
    // Add a callback to see what's happening with the acceptedFiles
    onDropAccepted: (files) => {
      console.log('Files accepted:', files);
    }
  });

  let dropzoneClass = "dropzone";
  if (isDragActive) {
    dropzoneClass += " dropzone-active";
  } else if (isProcessing) {
    dropzoneClass += " dropzone-processing";
  }

  return (
    <div
      {...getRootProps()}
      className={dropzoneClass}
    >
      <input {...getInputProps()} />
      <Upload className={isProcessing ? "upload-icon processing" : "upload-icon"} />
      <p className="upload-text">
        {isDragActive 
          ? 'Drop the file here' 
          : isProcessing 
            ? 'Processing file...' 
            : 'Drag & drop a file here, or click to select'}
      </p>
      <p className="upload-subtext">Support for CSV files (.csv)</p>
      {isProcessing && (
        <div className="processing-indicator">
          <div className="processing-bar"></div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;