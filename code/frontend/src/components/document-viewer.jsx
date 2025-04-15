import { useState, cloneElement } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import csv from 'papaparse';

import { Modal, ModalContent, useDisclosure } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Card } from "@heroui/card";
import { Spacer } from "@heroui/spacer";
import { Chip } from "@heroui/chip";
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell} from "@heroui/table";
import { Image } from "@heroui/image";
import { Code } from "@heroui/react";
import { Link } from "@heroui/link";

import {
  DocumentTextIcon,
  PhotoIcon,
  DocumentIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowUturnRightIcon,
  ArrowUturnLeftIcon,
  ArrowPathIcon,
  TableCellsIcon,
  ArrowDownTrayIcon
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
              <PhotoIcon className="h-20 text-white" />
            ) : document.metadata["MIMEType"].split("/")[0] === "text" ? (
              document.metadata["MIMEType"].split("/")[1] === "csv" ? (
                <TableCellsIcon className="h-20 text-white" />
              ) : (
                <DocumentTextIcon className="h-20 text-white" />
              )
            ) : (
              <DocumentIcon className="h-20 text-white" />
            )}  
          </div>
          <div className="m-4">
            <span className="flex flex-row gap-3">
              <h1 className="prose inline text-lg font-semibold text-gray-900">
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

const DownloadButton = ({ doc }) => {
  const handleDownload = () => {
    const blob = new Blob([atob(doc.data)], { type: doc.metadata["MIMEType"] });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = doc.metadata["FileName"] || "downloaded-file";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Button isIconOnly onPress={handleDownload}>
        <ArrowDownTrayIcon className="h-5 w-5" />
      </Button>
    </>
  );
};

const CSVviewer = ({ document }) => {
  
  const data = csv.parse(atob(document.data.toString())).data;
  // console.dir(data);

  return (
    <>
      <div className="flex flex-row items-center gap-4 mb-4">
        <h1 className="prose text-2xl">
          {document.metadata.FileName}
        </h1>
        <DownloadButton doc={document} />
      </div>
      {data.length > 0 && (
        <Table aria-label="Current table">
          <TableHeader>
            {data[0].map((header, index) => (
              <TableColumn key={index}><h1 className="prose text-xl font-bold">{header}</h1></TableColumn>
            ))}
          </TableHeader>
          <TableBody>
            {data.slice(1, data.length - 1).map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {row.map((value, colIndex) => (
                  <TableCell key={2 * rowIndex + colIndex}><p className="prose text-md">{value}</p></TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
};

const ImageViewer = ({ document }) => {
  const imageData = `data:${document.metadata["MIMEType"]};base64,${document.data}`;

  return (
    <>
      <div className="flex flex-row items-center gap-4 mb-4">
        <h1 className="prose text-2xl">
          {document.metadata.FileName}
        </h1>
        <DownloadButton doc={document} />
      </div>
      <div className="flex justify-center items-center">
        <Image
          src={imageData}
          alt={document.metadata["FileName"] || "Image"}
          className="max-w-full max-h-screen"
        />
      </div>
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
              <DownloadButton doc={document} />
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

  const viewerComponents = new Map([
    ["pdf", PDFViewer],
    ["csv", CSVviewer],
    ["png", ImageViewer],
  ]);

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
          {viewerComponents.get(document.metadata["MIMEType"].split("/")[1]) ? (
            viewerComponents
              .get(document.metadata["MIMEType"].split("/")[1])
              .call(this, { document })
          ) : (
            <div className="prose">
              <h1 className="prose text-2xl font-extrabold mb-3">Unsupported file type</h1>
              <p>
                The file type <Code color="primary">{document.metadata["MIMEType"]}</Code> is not supported
                for viewing.
                <Link
                  href={`data:${document.metadata["MIMEType"]};base64,${document.data}`}
                  download={document.metadata["FileName"] || "downloaded-file"}
                >&nbsp;Download the file instead.</Link>
              </p>
            </div>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default DocumentViewer;
export { DocumentCard, DocumentViewer };
