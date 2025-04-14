import {Button} from "@heroui/button";
import {Textarea} from "@heroui/input";
import {Divider} from "@heroui/divider";
import {Modal, ModalContent, useDisclosure} from "@heroui/modal";
import {Form} from "@heroui/form";
import {NumberInput} from "@heroui/number-input";
import {Spacer} from "@heroui/spacer";
import {Autocomplete, AutocompleteItem} from "@heroui/autocomplete";

import {PencilSquareIcon, CheckCircleIcon, ArrowsUpDownIcon, PlusIcon, CheckIcon} from "@heroicons/react/24/outline";

import {useContext, useEffect, useState} from "react";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import axios from "axios";

import { ProjectContext } from "../../project-context.jsx";
import { KPIUpdate } from "./timeline.jsx";

const Task = ({ task }) => {

  const [title, setTitle] = useState(task?.title);
  const [description, setDescription] = useState(task?.description);
  const [editableDescription, setEditableDescription] = useState(false);
  const [chronologicalOrder, setChronologicalOrder] = useState(false);
  const [documents, setDocuments] = useState([]);
  const ctx = useContext(ProjectContext);

  useEffect(() => {
    setTitle(task?.title);
  }, [task?.title]);
  useEffect(() => {
    setDescription(task?.description);
  }, [task?.description]);
  useEffect(() => {
    setDocuments(ctx.documents?.filter(doc => doc.task === task?.id));
  }, [ctx?.documents, task?.id]);

  // const updates = ctx.KPIUpdates.filter(update => update.task === task?.id );
  const [updates, setUpdates] = useState([]);
  useEffect(() => {
    // console.dir(ctx.KPIUpdates.filter(update => {
    //   // console.dir(update);
    //   return update.task === task?.id;
    // }));
    setUpdates(ctx.KPIUpdates.filter(update => update.task === task?.id ));
    // console.log(`updates for task ${task?.title}: ${updates.length}`);
  }, [ctx.KPIUpdates, task?.id]);
  
  // console.dir(updates);

  const buttonAction = () => {
    setEditableDescription(!editableDescription);
    if (editableDescription) {
      // await axios.fetch
      ctx.updateTaskDescription(task?.id, description);
    }
  };

  return (
    <>
      <Divider className="mt-10" />
      <h1 data-testid="task" className="prose text-5xl pl-10 mt-10">{title}</h1>
      <div className="pl-10">
        <h2 className="prose text-3xl p-10">Description</h2>
        <Textarea
          isReadOnly={!editableDescription}
          value={description}
          onValueChange={setDescription}
          className="max-w-2xl ml-10"
          endContent={
            <Button
              isIconOnly
              color={editableDescription ? 'success' : 'primary'}
              size='md'
              onPress={buttonAction}
            >
              {!editableDescription ? 
              <PencilSquareIcon className="size-5" /> : <CheckCircleIcon className="size-6" />}
            </Button>
          }
        />
        <h2 className="prose text-3xl p-10 flex items-center gap-5">
          KPI Updates
          <KPIUpdateButton task={task} />
          <Button isIconOnly onPress={() => setChronologicalOrder(!chronologicalOrder)}>
            <ArrowsUpDownIcon className="size-6" />
          </Button>
        </h2>
        {documents && documents.map(
          (document, index) => <DocumentViewer document={document} key={index} />
        )}
        {updates &&
          chronologicalOrder ? updates.map( (kpiupdate, index) => <KPIUpdate update={kpiupdate} key={index} /> ):
          updates.slice().reverse().map( (kpiupdate, index) => <KPIUpdate update={kpiupdate} key={index} /> )
        }
        <div className="pl-10 mt-1">
          {updates?.length === 0 && <p className='prose text-xl'>No KPI updates yet. Get started by adding one.</p>}
        </div>
      </div>
    </>
  );
};

const KPIUpdateButton = ({ task }) => {

  const {isOpen, onOpen, onOpenChange, onClose} = useDisclosure();
  const [loading, setLoading] = useState(false);

  const ctx = useContext(ProjectContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKPIid, setSelectedKPIid] = useState(null);
  const [finalValue, setFinalValue] = useState(""); // Initialize as empty string
  const [note, setNote] = useState("");
  const initialValue = ctx.adjustedKPIs?.find(kpi => kpi.id === selectedKPIid)?.current;

  const handleKPIselectionChange = (id) => {
    setSelectedKPIid(id);
    setSearchQuery(ctx.adjustedKPIs?.find(kpi => kpi.id === id)?.indicator || "");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true);
    // console.log("SUBMITTING");
    // console.log(finalValue);
    const update = {
      // id: `kpi${ctx.KPIUpdates.length + 1}`,
      project: ctx.project.id,
      task: task.id,
      kpi: selectedKPIid,
      note: note,
      initial: initialValue,
      final: finalValue,
      date: new Date(),
    };
    axios.put(`/api/kpi/update/${selectedKPIid}`, {
      project_id: ctx.project.id,
      task_id: task.id,
      kpi_id: selectedKPIid,
      initial: initialValue,
      final: finalValue,
      updated_at: new Date(),
      note: note,
    })
    .then(res => {
      // console.log(ctx.project.id);
      // console.dir(res);
      ctx.updateKPI({
        ...update,
        id: res.data.id,
        updatedby: res.data.updatedby
      });
      setLoading(false);
      onClose();
    })
    .catch(err => {
      console.error("Axios request failed:", err.response?.data?.message || err.message);
      setLoading(false);
      onClose();
    });
  };

  return (
    <>
      <Button data-testid="kpi-update-button" onPress={onOpen} isIconOnly>
        <PlusIcon className="size-6" />
      </Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        isDismissable={false}
        hideCloseButton={false}
        className="p-7"
      >
        <ModalContent>
          <Form onSubmit={handleSubmit}>
            <Spacer />
            <Autocomplete
              // autoFocus
              isRequired
              inputValue={searchQuery}
              onInputChange={setSearchQuery}
              selectedKey={selectedKPIid}
              onSelectionChange={handleKPIselectionChange}
              className="max-w-md"
              defaultItems={ctx.adjustedKPIs}
              label="KPI"
              placeholder="What KPI are you updating?"
            >
              {(item) => <AutocompleteItem key={item.id}>{item.indicator}</AutocompleteItem>}
            </Autocomplete>
            <NumberInput
              isInvalid={finalValue == null}
              label="Final value"
              isRequired
              value={finalValue}
              onValueChange={setFinalValue}
            />
            <Textarea
              label="Note"
              value={note}
              onValueChange={setNote}
            />
            <Spacer />
            <Button isLoading={loading} color='primary' type="submit" startContent={<CheckIcon className="size-6" />}>Update</Button>
            <Spacer />
          </Form>
        </ModalContent>
      </Modal>
    </>
  );
};

const DocumentViewer = ({ document }) => {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfData, setPdfData] = useState(document.data);
  const [scale, setScale] = useState(1.0);

  useEffect(() => {
    if (document?.data) {
      const dataUri = `data:application/pdf;base64,${document.data}`;
      setPdfData(dataUri);
    }
  }, [document?.data]);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  const zoomIn = () => setScale((prevScale) => Math.min(prevScale + 0.2, 3.0)); // Max zoom level: 3.0
  const zoomOut = () => setScale((prevScale) => Math.max(prevScale - 0.2, 0.5)); // Min zoom level: 0.5

  return (
    <>
      <Button
        color="primary"
        onPress={onOpen}
        className="ml-5"
      >
        {document.metadata.Title || document.metadata['File Name'] || "Unnamed document"}
      </Button>
      <Modal
        size="5xl"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        hideCloseButton={false}
        scrollBehavior="outside"
      >
        <ModalContent className="p-7 m-10">
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
                <Document file={pdfData} onLoadSuccess={onDocumentLoadSuccess} className='overflow-scroll'>
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
        </ModalContent>
      </Modal>
    </>
  );
};

export default Task;
export {Task, KPIUpdateButton, DocumentViewer};
