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
import Dropzone from '../../components/file-drop-zone.jsx';

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
        <Dropzone />
      </div>
    </div>
    </>
  );
};

export default Overview;