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
import {Progress} from "@heroui/progress";
import Dropzone from '../../components/file-drop-zone.jsx';

import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";

import { useState, useContext, useEffect } from 'react';
import axios from 'axios';

import { ProjectContext } from "../project-context.jsx";
import DocumentViewer, { DocumentCard } from "../../components/document-viewer.jsx";

const Overview = () => {
  const ctx = useContext(ProjectContext);
  const [documents, setDocuments] = useState([]);
  useEffect(() => {
    setDocuments(ctx.documents?.filter(doc => !doc.task));
  }, [ctx?.documents]);
  console.log(ctx.adjustedProgress);
  const predictedEndDate = Date(Date(ctx.project.start) + Date((Date(ctx.project.end) - Date(ctx.project.start))/(ctx.adjustedProgress)));
  console.log(predictedEndDate);
  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };
  console.log(predictedEndDate > Date(ctx.project.end));
  return (
    <>
    <div className="my-10 mx-20">
      <div className="mb-5">
        <h1 className="prose text-3xl font-semibold">Progress</h1>
        <Progress
          value={ctx.adjustedProgress*100}
          aria-label="Project progress"
          // color="blue"
          className="mt-2"
          size="lg"
          label={
            <div className="flex flex-row justify-between">
              <span className="text-md font-semibold text-primary">{parseInt(ctx.adjustedProgress*100)}%</span>
            </div>
          }
        />
        <p className="prose text-lg">
          Expected to finish by {
            predictedEndDate && predictedEndDate !== 'Invalid Date' && predictedEndDate > ctx.project.end ?
            <span className="prose text-danger">{formatDate(predictedEndDate)} (Overdue)</span> : formatDate(predictedEndDate)
          }
        </p>
      </div>
      <h1 className="prose text-3xl font-semibold">About this project</h1>
      <p className="prose text-lg">{ctx.project.description || "No information added yet."}</p>
      <h1 className="prose text-3xl font-semibold mt-5">Documents</h1>
      <div className="flex flex-row flex-wrap gap-3 my-3 items-stretch">
        {documents && documents.map(
          (document, index) => <DocumentViewer document={document} slot={<DocumentCard />} key={index} />
        )}
        <Dropzone />
      </div>
    </div>
    </>
  );
};

export default Overview;