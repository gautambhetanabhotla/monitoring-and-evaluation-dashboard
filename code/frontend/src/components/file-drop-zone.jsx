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
  const [docToBeUploaded, setDocToBeUploaded] = useState(null);
  const {isOpen, onOpen, onOpenChange, onClose} = useDisclosure();

  const uploadDocument = () => {
    console.log("Uploading document");
    onClose();
    const formData = new FormData();
    formData.append('projectId', ctx.project.id);
    taskId && formData.append('taskId', taskId);
    kpiUpdateId && formData.append('kpiUpdateId', kpiUpdateId);
    // formData.append('data', docToBeUploaded.data); // should be a File or Blob
    formData.append('createdBy', actx.user.id);
    formData.append('meta', JSON.stringify(docToBeUploaded.metadata));
    formData.append('file', docToBeUploaded.file); // should be a File or Blob
    try {
      let doc = docToBeUploaded;
      console.log(docToBeUploaded.file);
      axios.post('/api/document/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        }
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
        setDocToBeUploaded(null);
      })
      .catch((error) => {
        console.error("Error uploading document:", error);

        addToast({
          title: "Failure uploading document",
          description: doc.metadata?.FileName || "Unnamed document",
          color: "danger",
          duration: 2000
        });
        setDocToBeUploaded(null);
      });
      
    } catch (error) {
      console.error("Error during upload process:", error);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size='xl'>
        <ModalContent>
          <ModalHeader><h1 className="prose text-2xl">Upload Documents</h1></ModalHeader>
          <ModalBody>
            <DocumentViewer
              document={docToBeUploaded}
              slot={<DocumentCard />}
            />
          </ModalBody>
          <ModalFooter>
            <Button onPress={uploadDocument}>Upload</Button>
            <Button
              onPress={() => {
                setDocToBeUploaded(null);
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
          try {
            // Wrap FileReader in a Promise for each file
            const fileObjects = await Promise.all(
              acceptedFiles.map((file) => {
                return new Promise((resolve, reject) => {
                  const reader = new FileReader();
        
                  reader.onabort = () => {
                    console.error('File reading was aborted');
                    reject(new Error('File reading was aborted'));
                  };
        
                  reader.onerror = () => {
                    console.error('File reading has failed');
                    reject(new Error('File reading has failed'));
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
                      file,
                    });
                  };
        
                  reader.readAsArrayBuffer(file); // Read the file as an ArrayBuffer
                });
              })
            );
        
            // console.log(fileObjects[0]); // Now this will have the processed data
            setDocToBeUploaded(fileObjects[0]); // Update state with the first processed file
            onOpen(); // Open the modal
          } catch (error) {
            console.error('Error processing files:', error);
          }
        }}
        accept={{ 'application/pdf': ['.pdf'], 'image/*': ['.jpeg', '.jpg', '.png'], 'text/*': ['.csv', '.txt'] }}
        // noClick
        noKeyboard
      >
        {({ getRootProps, getInputProps, isDragActive, open }) => (
          <div
            {...getRootProps({
              onClick: (event) => {
                event.stopPropagation();
                event.preventDefault();
                if (!docToBeUploaded) {
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
              <p className="text-blue-500">Drop the file here...</p>
            ) : (
              <p className="text-gray-500">Drag and drop a file here, or click to select one</p>
            )}
          </div>
        )}
      </Dropzone>
    </>
  );
};

export default FileDropZone;
