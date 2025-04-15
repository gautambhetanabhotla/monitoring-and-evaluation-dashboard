import { useState, cloneElement } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

import { Modal, ModalContent, useDisclosure } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Card } from "@heroui/card";
import { Spacer } from "@heroui/spacer";
import { Chip } from "@heroui/chip";

import {
  DocumentTextIcon,
  PhotoIcon,
  DocumentIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowUturnRightIcon,
  ArrowUturnLeftIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

const DocumentCard = ({ document, onPress }) => {
  return (
    <>
      <Card isPressable onPress={onPress}>
        <div className="flex flex-row flex-wrap h-auto">
          <div className="flex items-center justify-center bg-blue-500 p-5">
            {document.metadata["MIMEType"] === "application/pdf" ? (
              <DocumentTextIcon className="h-20 text-white" />
            ) : document.metadata["MIMEType"].split("/")[0] === "image" ? (
              <PhotoIcon className="w-6 h-6 text-white" />
            ) : (
              <DocumentIcon className="w-6 h-6 text-white" />
            )}
          </div>
          <div className="m-4">
            <span className="flex flex-row gap-3">
              <h1 className="prose text-lg font-semibold text-gray-900">
                {document.metadata.Title ||
                  document.metadata["FileName"] ||
                  "Unnamed document"}
              </h1>
              <Chip>{document.metadata["FileType"]}</Chip>
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
            <div className="flex flex-row gap-2 justify-start items-center mb-4">
              <Button isIconOnly onPress={zoomOut} isDisabled={scale <= 0.5} >
                <MagnifyingGlassMinusIcon className="h-5 w-5" />
              </Button>
              <Button isIconOnly onPress={zoomReset}>
                <ArrowPathIcon className="h-5 w-5" />
              </Button>
              <Button isIconOnly onPress={zoomIn} isDisabled={scale >= 3.0} >
                <MagnifyingGlassPlusIcon className="h-5 w-5" />
              </Button>
              <p className="prose">Zoom: {Math.round(scale * 100)}%</p>
              <Spacer x={1} />
              <Button
                isIconOnly
                isDisabled={pageNumber <= 1}
                onPress={() => setPageNumber(pageNumber - 1)}
              >
                <ArrowUturnLeftIcon className="h-5 w-5" />
              </Button>
              <Button
                isIconOnly
                isDisabled={pageNumber >= numPages}
                onPress={() => setPageNumber(pageNumber + 1)}
              >
                <ArrowUturnRightIcon className="h-5 w-5" />
              </Button>
              <p className="prose">Page {pageNumber} of {numPages}</p>
            </div>
            <Document
              file={pdfData}
              onLoadSuccess={onDocumentLoadSuccess}
              className="overflow-scroll"
            >
              <Page pageNumber={pageNumber} scale={scale} />
            </Document>
            
            
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
