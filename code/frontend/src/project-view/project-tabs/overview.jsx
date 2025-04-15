import {Button} from "@heroui/button";
import {Textarea} from "@heroui/input";
// import {Divider} from "@heroui/divider";
import {Card} from "@heroui/card";
import {Link} from "@heroui/link";
import {Autocomplete, AutocompleteItem} from "@heroui/autocomplete";
import {Select, SelectItem} from "@heroui/select";
// import {Chip} from "@heroui/chip";
import {Popover, PopoverTrigger, PopoverContent} from "@heroui/popover";
import {Form} from "@heroui/form";
import {Input} from "@heroui/input";
// import {NumberInput} from "@heroui/number-input";
import {Spacer} from "@heroui/spacer";
import Dropzone from 'react-dropzone';

import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";

import { useState, useContext, useEffect } from 'react';
import axios from 'axios';

import { ProjectContext } from "../project-context.jsx";
import  DocumentViewer, { DocumentCard } from "../../components/document-viewer.jsx";

const Overview = () => {
  const ctx = useContext(ProjectContext);
  const [documents, setDocuments] = useState([]);
  useEffect(() => {
    setDocuments(ctx.documents?.filter(doc => !doc.task));
  }, [ctx?.documents]);
  return (
    <>
    <div className="p-10">
      <h1 className="prose text-3xl mx-3 font-semibold">Documents</h1>
      <div className="flex flex-row flex-wrap gap-3 m-3 items-stretch">
        {documents && documents.map(
          (document, index) => <DocumentViewer document={document} slot={<DocumentCard />} key={index} />
        )}
        <Dropzone
          onDrop={
            async (acceptedFiles) => {
              acceptedFiles.forEach((file) => {
                const reader = new FileReader();
                reader.onabort = () => console.log('file reading was aborted');
                reader.onerror = () => console.log('file reading has failed');
                reader.onload = () => {
                  ctx.addDocument({
                    project: ctx.project.id,
                    data: reader.result
                  });
                };
                reader.readAsArrayBuffer(file);
              });
              // await axios.post('/api/upload', formData, {
              //   headers: {
              //     'Content-Type': 'multipart/form-data',
              //   },
              // });
            }
          }
          accept={{ 'application/pdf': ['.pdf'], 'image/*': ['.jpeg', '.jpg', '.png'] }}
          multiple
          // noClick
          noKeyboard
        >
          {({ getRootProps, getInputProps, isDragActive }) => (
            <div
              {...getRootProps()}
              className="w-full
                         flex
                         flex-col
                         items-center
                         justify-center
                         border-2
                         border-gray-300
                         hover:border-blue-500
                         transition-colors
                         border-dashed
                         rounded-xl
                         max-w-sm
                         p-5
                         py-6
                         h-auto"
            >
              <ArrowUpTrayIcon className="h-10 w-10 text-gray-500" />
              <input {...getInputProps()} />
              {isDragActive ? (
                <p className="text-blue-500">Drop the files here...</p>
              ) : (
                <p className="text-gray-500">Drag and drop files here, or click to select files</p>
              )}
            </div>
          )}
        </Dropzone>
      </div>
    </div>
    </>
  );
};

export default Overview;