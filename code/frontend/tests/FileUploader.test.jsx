import React from 'react';
import { render, fireEvent, waitFor, screen, act } from '@testing-library/react';
import FileUploader from '../src/project-view/project-page-charts/FileUploader.jsx';
import '@testing-library/jest-dom';

let capturedOnDrop;

jest.mock('react-dropzone', () => ({
  useDropzone: (options) => {
    capturedOnDrop = options.onDrop;
    return {
      getRootProps: () => ({
        onDrop: options.onDrop,
      }),
      getInputProps: () => ({}),
      isDragActive: false,
    };
  },
}));

function createFile(name, content, type = 'text/csv') {
  const blob = new Blob([content], { type });
  blob.lastModified = Date.now();
  blob.name = name;
  return blob;
}

describe('FileUploader', () => {
  const onDataLoaded = jest.fn();

  test('renders drag and drop instructions', () => {
    render(<FileUploader onDataLoaded={onDataLoaded} />);
    expect(screen.getByText(/Drag & drop a file here, or click to select/i)).toBeInTheDocument();
  });

  test('processes a CSV file on drop', async () => {
    render(<FileUploader onDataLoaded={onDataLoaded} />);
    const fileContent = 'col1,col2\nval1,val2';
    const file = createFile('test.csv', fileContent, 'text/csv');

    expect(typeof capturedOnDrop).toBe('function');

    await act(async () => {
      capturedOnDrop([file]);
    });

    await waitFor(() => expect(onDataLoaded).toHaveBeenCalled());
    const [data, headers] = onDataLoaded.mock.calls[0];
    expect(headers).toEqual(['col1', 'col2']);
    expect(data[0]).toEqual({ col1: 'val1', col2: 'val2' });
  });
});
