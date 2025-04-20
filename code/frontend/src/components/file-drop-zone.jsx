import Dropzone from 'react-dropzone';
import { ProjectContext } from "../project-view/project-context.jsx";
import { AuthContext } from "../AuthContext.jsx";
import axios from 'axios';
import { useContext, useState } from 'react';
import { ArrowUpTrayIcon, TrashIcon } from "@heroicons/react/24/outline";
import {  Modal,  ModalContent,  ModalHeader,  ModalBody,  ModalFooter, useDisclosure} from "@heroui/modal";
import { addToast } from "@heroui/toast";
import { DocumentCard, DocumentViewer } from "./document-viewer.jsx";
import { Button } from "@heroui/button";

function _arrayBufferToBase64( buffer ) {
  var binary = '';
  var bytes = new Uint8Array( buffer );
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
      binary += String.fromCharCode( bytes[ i ] );
  }
  return window.btoa( binary );
}

const FileDropZone = ({ kpiUpdateId, taskId }) => {

  const ctx = useContext(ProjectContext);
  const actx = useContext(AuthContext);
  const [docsToBeUploaded, setDocsToBeUploaded] = useState([]);
  const {isOpen, onOpen, onOpenChange, onClose} = useDisclosure();

  const uploadDocuments = async () => {
    try {
      // Map over the documents and create an array of promises
      const uploadPromises = docsToBeUploaded.map((doc) =>
        axios.post('/api/document/upload', {
          projectId: ctx.project.id,
          taskId,
          kpiUpdateId,
          data: doc.data,
          createdBy: actx.user.id,
          meta: doc.metadata
        })
        .then((response) => {
          console.dir(response);
          ctx.addDocument({
            ...doc,
            ...response.data
          });
          addToast({
            title: "Document uploaded successfully",
            description: doc.metadata?.FileName || "Unnamed document",
            color: "success",
            duration: 2000
          });
          setDocsToBeUploaded(docsToBeUploaded => docsToBeUploaded.filter(d => d !== doc));
        })
        .catch((error) => {
          console.error("Error uploading document:", error);
  
          addToast({
            title: "Failure uploading document",
            description: doc.metadata?.FileName || "Unnamed document",
            color: "danger",
            duration: 2000
          });
        })
      );
  
      // Wait for all uploads to complete
      await Promise.all(uploadPromises);
  
      // Clear the uploaded documents from the state
      setDocsToBeUploaded([]);
    } catch (error) {
      console.error("Error during upload process:", error);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader><h1 className="prose text-2xl">Upload Documents</h1></ModalHeader>
          <ModalBody>
            {docsToBeUploaded.map((doc, index) => {
              return (
                <DocumentViewer
                  key={index}
                  document={doc}
                  slot={<DocumentCard />}
                />
              );
            })}
          </ModalBody>
          <ModalFooter>
            <Button onPress={uploadDocuments}>Upload</Button>
            <Button
              onPress={() => {
                setDocsToBeUploaded([]);
                onClose();
              }}
              color="danger"
              variant='bordered'
              startContent={<TrashIcon className="h-5 w-5" />}
            >
              Clear selection
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Dropzone
        onDrop={async (acceptedFiles) => {
          const filePromises = acceptedFiles.map((file) => {
            return new Promise((resolve, reject) => {
              const reader = new FileReader();
        
              reader.onabort = () => {
                console.log('File reading was aborted');
                reject('File reading was aborted');
              };
        
              reader.onerror = () => {
                console.log('File reading has failed');
                reject('File reading has failed');
              };
        
              reader.onload = () => {
                const arrayBuffer = reader.result; // This is an ArrayBuffer
                const base64Data = _arrayBufferToBase64(arrayBuffer); // Convert to Base64
                resolve({
                  project: ctx.project.id,
                  data: base64Data, // Base64-encoded data
                  createdBy: actx.user.id,
                  metadata: {
                    MIMEType: file.type,
                    FileName: file.name,
                  },
                });
              };
        
              reader.readAsArrayBuffer(file); // Read the file as an ArrayBuffer
            });
          });
        
          try {
            const fileObjects = await Promise.all(filePromises); // Wait for all files to be processed
            setDocsToBeUploaded([...docsToBeUploaded, ...fileObjects]); // Update state with processed files
            onOpen(); // Open the modal
          } catch (error) {
            console.error('Error processing files:', error);
          }
        }}
        accept={{ 'application/pdf': ['.pdf'], 'image/*': ['.jpeg', '.jpg', '.png'], 'text/*': ['.csv', '.txt'] }}
        multiple
        // noClick
        noKeyboard
      >
        {({ getRootProps, getInputProps, isDragActive, open }) => (
          <div
            {...getRootProps({
              onClick: (event) => {
                event.stopPropagation();
                event.preventDefault();
                if (docsToBeUploaded.length === 0) {
                  open(); // Open the file dialog if no files are uploaded
                } else {
                  onOpen(); // Open the modal if files are already uploaded
                }
              }
            })}
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
    </>
  );
};

export default FileDropZone;
