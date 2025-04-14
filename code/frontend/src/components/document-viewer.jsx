import { useState, useEffect, cloneElement } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

import { Modal, ModalContent, useDisclosure } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Card } from "@heroui/card";
// import { Spacer } from "@heroui/spacer";
import { Chip } from "@heroui/chip";

import {
  DocumentTextIcon,
  PhotoIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";

const DocumentCard = ({ document, onPress }) => {
  return (
    <>
      <Card isPressable onPress={onPress} className="m-3">
        <div className="flex flex-row h-auto">
          <div className="flex items-center justify-center bg-blue-500 p-5">
            {document.metadata["MIME Type"] === "application/pdf" ? (
              <DocumentTextIcon className="h-20 text-white" />
            ) : document.metadata["MIME Type"].split("/")[0] === "image" ? (
              <PhotoIcon className="w-6 h-6 text-white" />
            ) : (
              <DocumentIcon className="w-6 h-6 text-white" />
            )}
          </div>
          <div className="m-4">
            <span className="flex flex-row gap-3">
              <h1 className="prose text-lg font-semibold text-gray-900">
                {document.metadata.Title ||
                  document.metadata["File Name"] ||
                  "Unnamed document"}
              </h1>
              <Chip>{document.metadata["MIME Type"].split("/")[1]}</Chip>
            </span>
          </div>
        </div>
      </Card>
    </>
  );
};

const PDFViewer = ({ document }) => {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const pdfData = `data:application/pdf;base64,${document.data}`;
  const [scale, setScale] = useState(1.0);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  const zoomIn = () => setScale((prevScale) => Math.min(prevScale + 0.2, 3.0)); // Max zoom level: 3.0
  const zoomOut = () => setScale((prevScale) => Math.max(prevScale - 0.2, 0.5)); // Min zoom level: 0.5
  const zoomReset = () => setScale(1.0); // Reset to default zoom level

  return (
    <>
      <div>
        {pdfData && (
          <>
            <div className="flex justify-between items-center mb-4">
              <Button onPress={zoomOut} disabled={scale <= 0.5}>
                Zoom Out
              </Button>
              <p>Zoom: {Math.round(scale * 100)}%</p>
              <Button onPress={zoomIn} disabled={scale >= 3.0}>
                Zoom In
              </Button>
            </div>
            <Document
              file={pdfData}
              onLoadSuccess={onDocumentLoadSuccess}
              className="overflow-scroll"
            >
              <Page pageNumber={pageNumber} scale={scale} />
            </Document>
            <p>
              Page {pageNumber} of {numPages}
            </p>
            <Button
              disabled={pageNumber <= 1}
              onPress={() => setPageNumber(pageNumber - 1)}
            >
              Previous
            </Button>
            <Button
              disabled={pageNumber >= numPages}
              onPress={() => setPageNumber(pageNumber + 1)}
            >
              Next
            </Button>
          </>
        )}
      </div>
    </>
  );
};

const DocumentViewer = ({ document, slot }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      {slot && cloneElement(slot, { onPress: onOpen, document: document })}
      <Modal
        size="5xl"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        hideCloseButton={false}
        scrollBehavior="outside"
      >
        <ModalContent className="p-7 m-10">
          <PDFViewer document={document} />
        </ModalContent>
      </Modal>
    </>
  );
};

export default DocumentViewer;
export { DocumentCard, DocumentViewer };
